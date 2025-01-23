package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/mattn/go-sqlite3"
)

func AddNewPost(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, http_request *http.Request) {
		type ForumPost struct {
			Title       string `json:"title"`
			Username    string `json:"username"`
			Category    string `json:"category"`
			Keywords    string `json:"keywords"`
			Description string `json:"description"`
		}

		var request ForumPost
		if err := json.NewDecoder(http_request.Body).Decode(&request); err != nil {
			http.Error(writer, "Invalid Request Body", http.StatusBadRequest)
			return
		}

		insertion := "INSERT INTO posts (title, username, category, keywords, description, timing) VALUES (?, ?, ?, ?, ?, ?)"
		_, err := db.Exec(insertion, request.Title, request.Username,
			request.Category, request.Keywords, request.Description, time.Now())

		if err == sqlite3.ErrConstraint {
			http.Error(writer, "Item already exists", http.StatusConflict)
			return
		} else if err != nil {
			http.Error(writer, "Failed to add new post", http.StatusInternalServerError)
			return
		}

		writer.WriteHeader(http.StatusCreated)
	}
}

func UpdatePost(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, http_request *http.Request) {
		type ForumPostUpdate struct {
			OriginalTitle string `json:"origTitle"`
			Title         string `json:"title"`
			Username      string `json:"username"`
			Category      string `json:"category"`
			Keywords      string `json:"keywords"`
			Description   string `json:"description"`
		}

		var request ForumPostUpdate
		if err := json.NewDecoder(http_request.Body).Decode(&request); err != nil {
			http.Error(writer, "Invalid Request Body", http.StatusBadRequest)
			return
		}

		update := "UPDATE posts SET title = ?, category = ?, keywords = ?, description = ? WHERE title = ? AND username = ?"
		_, err := db.Exec(update, request.Title, request.Category, request.Keywords, request.Description, request.OriginalTitle, request.Username)

		if err != nil {
			http.Error(writer, "Failed to add new user", http.StatusInternalServerError)
			return
		}

		writer.WriteHeader(http.StatusNoContent)
	}
}

type ForumPostReturn struct {
	PostID      int       `json:"postid"`
	Title       string    `json:"title"`
	Username    string    `json:"username"`
	Category    string    `json:"category"`
	Keywords    string    `json:"keywords"`
	Description string    `json:"description"`
	Timing      time.Time `json:"time"`
}

func GetAllForumData(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, http_request *http.Request) {
		rows, err := db.Query("SELECT * FROM posts ORDER BY timing DESC")
		if err == sql.ErrNoRows {
			http.Error(writer, "No forum data available", http.StatusNotFound)
			return
		}

		var id int
		var title string
		var username string
		var category string
		var keywords string
		var description string
		var timing time.Time

		var data []ForumPostReturn

		for rows.Next() && err == nil {
			err = rows.Scan(&id, &title, &username, &category, &keywords, &description, &timing)
			if err != nil {
				http.Error(writer, "Failed to scan", http.StatusInternalServerError)
				return
			}
			var post ForumPostReturn = ForumPostReturn{id, title, username, category, keywords, description, timing}
			data = append(data, post)
		}

		if len(data) == 0 {
			http.Error(writer, "Failed to get posts", http.StatusNotFound)
			return
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

		query += " ORDER BY timing DESC"

		var id int
		var title string
		var username string
		var category string
		var keywords string
		var description string
		var timing time.Time
		var data []ForumPostReturn

		rows, err := db.Query(query, args...)
		if err == sql.ErrNoRows {
			http.Error(writer, "No forum data available", http.StatusNotFound)
			return
		}

		for rows.Next() && err == nil {
			err = rows.Scan(&id, &title, &username, &category, &keywords, &description, &timing)
			if err != nil {
				http.Error(writer, "Failed to scan", http.StatusInternalServerError)
				return
			}
			var post ForumPostReturn = ForumPostReturn{id, title, username, category, keywords, description, timing}
			data = append(data, post)
		}

		if len(data) == 0 {
			http.Error(writer, "Failed to get posts", http.StatusNotFound)
			return
		} else {
			writer.Header().Set("Content-Type", "application/json")
			writer.WriteHeader(http.StatusOK)
			json.NewEncoder(writer).Encode(map[string][]ForumPostReturn{
				"data": data,
			})
		}
	}
}

func GetUserForumPosts(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, http_request *http.Request) {
		rows, err := db.Query("SELECT * FROM posts WHERE username=? ORDER BY timing DESC", http_request.URL.Query().Get("user"))
		if err == sql.ErrNoRows {
			http.Error(writer, "No forum data available", http.StatusNotFound)
			return
		}

		var id int
		var title string
		var username string
		var category string
		var keywords string
		var description string
		var timing time.Time

		var data []ForumPostReturn

		for rows.Next() {
			err = rows.Scan(&id, &title, &username, &category, &keywords, &description, &timing)
			if err != nil {
				http.Error(writer, "Failed to scan", http.StatusInternalServerError)
				return
			}
			var post ForumPostReturn = ForumPostReturn{id, title, username, category, keywords, description, timing}
			data = append(data, post)
		}

		if len(data) == 0 {
			http.Error(writer, "Failed to get posts", http.StatusNotFound)
			return
		} else {
			writer.Header().Set("Content-Type", "application/json")
			writer.WriteHeader(http.StatusOK)
			json.NewEncoder(writer).Encode(map[string][]ForumPostReturn{
				"data": data,
			})
		}
	}
}

func DeleteForumPost(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, http_request *http.Request) {
		postID := http_request.URL.Query().Get("postID")

		_, err := db.Exec("DELETE FROM posts WHERE postid = ?", postID)
		if err != nil {
			http.Error(writer, "Failed to delete post", http.StatusNotFound)
			return
		} else {
			writer.WriteHeader(http.StatusNoContent)
		}
	}
}

func AddNewComment(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, http_request *http.Request) {
		type NewComment struct {
			Post      int    `json:"postID"`
			Commenter string `json:"commenter"`
			Comment   string `json:"comment"`
		}

		var new_comment NewComment
		err := json.NewDecoder(http_request.Body).Decode(&new_comment)
		if err != nil {
			http.Error(writer, "Invalid Request Body", http.StatusBadRequest)
			return
		}

		_, err = db.Exec("INSERT INTO comments (post, commenter, comment, timing) VALUES (?, ?, ?, ?)",
			new_comment.Post, new_comment.Commenter, new_comment.Comment, time.Now())

		if err != nil {
			http.Error(writer, "Could not insert into database", http.StatusInternalServerError)
			return
		}

		writer.WriteHeader(http.StatusCreated)
	}
}

func GetCommentsForPost(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, http_request *http.Request) {
		postID := http_request.URL.Query().Get("postID")

		rows, err := db.Query("SELECT commentid, commenter, comment, timing FROM comments WHERE post = ?", postID)
		if err == sql.ErrNoRows {
			http.Error(writer, "No forum data available", http.StatusNotFound)
			return
		}

		var commentID int
		var commenter string
		var comment string
		var timing time.Time

		type commentReturn struct {
			CommentID int       `json:"commentID"`
			Commenter string    `json:"commenter"`
			Comment   string    `json:"comment"`
			Timing    time.Time `json:"timing"`
		}

		var data []commentReturn

		for rows.Next() {
			err = rows.Scan(&commentID, &commenter, &comment, &timing)
			if err != nil {
				http.Error(writer, "Failed to scan", http.StatusInternalServerError)
				return
			}
			var comments commentReturn = commentReturn{commentID, commenter, comment, timing}
			data = append(data, comments)
		}

		if len(data) == 0 {
			http.Error(writer, "Failed to get posts", http.StatusNotFound)
			return
		} else {
			writer.Header().Set("Content-Type", "application/json")
			writer.WriteHeader(http.StatusOK)
			json.NewEncoder(writer).Encode(map[string][]commentReturn{
				"data": data,
			})
		}

	}
}
