package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
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

		writer.Header().Set("Content-Type", "application/json")
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
