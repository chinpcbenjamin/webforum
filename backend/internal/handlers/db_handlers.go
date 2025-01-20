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
