package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type ForumPost struct {
	Title       string `json:"title"`
	Username    string `json:"username"`
	Category    string `json:"category"`
	Keywords    string `json:"keywords"`
	Description string `json:"description"`
}

func AddNewPost(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, http_request *http.Request) {
		var request ForumPost
		if err := json.NewDecoder(http_request.Body).Decode(&request); err != nil {
			http.Error(writer, "Invalid Request Body", http.StatusBadRequest)
		}

		insertion := "INSERT INTO posts VALUES (?, ?, ?, ?, ?, ?)"
		_, err := db.Exec(insertion, request.Title, request.Username,
			request.Category, request.Keywords, request.Description, time.Now())

		if err != nil {
			http.Error(writer, "Failed to add new user", http.StatusInternalServerError)
			return
		}

		writer.WriteHeader(http.StatusCreated)
	}
}

type ForumPostReturn struct {
	Title       string    `json:"title"`
	Username    string    `json:"username"`
	Category    string    `json:"category"`
	Keywords    string    `json:"keywords"`
	Description string    `json:"description"`
	Timing      time.Time `json:"time"`
}

func GetAllForumData(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, http_request *http.Request) {
		rows, err := db.Query("SELECT * FROM posts")
		if err == sql.ErrNoRows {
			http.Error(writer, "No forum data available", http.StatusNoContent)
		}

		var title string
		var username string
		var category string
		var keywords string
		var description string
		var timing time.Time

		var data []ForumPostReturn

		for rows.Next() && err == nil {
			err = rows.Scan(&title, &username, &category, &keywords, &description, &timing)
			if err != nil {
				http.Error(writer, "Failed to scan", http.StatusInternalServerError)
			}
			var post ForumPostReturn = ForumPostReturn{title, username, category, keywords, description, timing}
			data = append(data, post)
		}

		if len(data) == 0 {
			http.Error(writer, "Failed to get posts", http.StatusInternalServerError)
		} else {
			writer.Header().Set("Content-Type", "application/json")
			writer.WriteHeader(http.StatusOK)
			json.NewEncoder(writer).Encode(map[string][]ForumPostReturn{
				"data": data,
			})
		}

	}
}

func GetFilteredForumData(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, http_request *http.Request) {
		var word string = http_request.URL.Query().Get("keywords")
		var categories string = http_request.URL.Query().Get("category")

		args := []interface{}{}
		query := "SELECT * FROM posts"

		if word != "" {
			query += " WHERE (title LIKE ? OR keywords LIKE ?)"
			args = append(args, "%"+word+"%", "%"+word+"%")
		}

		filters := []string{}
		if string(categories[0]) == "1" {
			filters = append(filters, "Suggestion")
		}
		if string(categories[2]) == "1" {
			filters = append(filters, "Problem")
		}
		if string(categories[4]) == "1" {
			filters = append(filters, "General")
		}

		if len(filters) > 0 {
			if len(args) > 0 {
				query += " AND"
			} else {
				query += " WHERE"
			}
			query += " category IN (" + strings.Repeat("?,", len(filters)-1) + "?)"
			for _, f := range filters {
				args = append(args, f)
			}
		}

		var title string
		var username string
		var category string
		var keywords string
		var description string
		var timing time.Time
		var data []ForumPostReturn

		rows, err := db.Query(query, args...)
		if err == sql.ErrNoRows {
			http.Error(writer, "No forum data available", http.StatusNoContent)
			return
		}

		for rows.Next() && err == nil {
			err = rows.Scan(&title, &username, &category, &keywords, &description, &timing)
			if err != nil {
				http.Error(writer, "Failed to scan", http.StatusInternalServerError)
			}
			var post ForumPostReturn = ForumPostReturn{title, username, category, keywords, description, timing}
			data = append(data, post)
		}

		if len(data) == 0 {
			http.Error(writer, "Failed to get posts", http.StatusNoContent)
		} else {
			writer.Header().Set("Content-Type", "application/json")
			writer.WriteHeader(http.StatusOK)
			json.NewEncoder(writer).Encode(map[string][]ForumPostReturn{
				"data": data,
			})
		}
	}
}

type NewComment struct {
	Commenter string `json:"commenter"`
	Comment   string `json:"comment"`
	Title     string `json:"title"`
	Username  string `json:"username"`
}

func AddNewComment(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, http_request *http.Request) {
		var new_comment NewComment
		err := json.NewDecoder(http_request.Body).Decode(&new_comment)
		if err != nil {
			http.Error(writer, "Invalid Request Body", http.StatusBadRequest)
			return
		}

		_, err = db.Exec("INSERT INTO comments VALUES (?, ?, ?, ?, ?)",
			new_comment.Commenter, new_comment.Comment, time.Now(), new_comment.Title, new_comment.Username,
		)

		if err != nil {
			http.Error(writer, "Could not insert into database", http.StatusInternalServerError)
		}

		writer.WriteHeader(http.StatusCreated)
	}
}

func GetCommentsForPost(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, http_request *http.Request) {
		title := http_request.URL.Query().Get("title")
		username := http_request.URL.Query().Get("username")

		rows, err := db.Query("SELECT commenter, comment, timing FROM comments WHERE title = ? AND username = ?", title, username)
		if err == sql.ErrNoRows {
			http.Error(writer, "No forum data available", http.StatusNoContent)
		}

		var commenter string
		var comment string
		var timing time.Time

		type commentReturn struct {
			Commenter string    `json:"commenter"`
			Comment   string    `json:"comment"`
			Timing    time.Time `json:"timing"`
		}

		var data []commentReturn

		for rows.Next() {
			err = rows.Scan(&commenter, &comment, &timing)
			if err != nil {
				http.Error(writer, "Failed to scan", http.StatusInternalServerError)
			}
			var comments commentReturn = commentReturn{commenter, comment, timing}
			data = append(data, comments)
		}

		if len(data) == 0 {
			http.Error(writer, "Failed to get posts", http.StatusInternalServerError)
		} else {
			writer.Header().Set("Content-Type", "application/json")
			writer.WriteHeader(http.StatusOK)
			json.NewEncoder(writer).Encode(map[string][]commentReturn{
				"data": data,
			})
		}

	}
}
