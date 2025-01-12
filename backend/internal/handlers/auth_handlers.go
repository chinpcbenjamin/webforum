// this handles functions/requests related to user authentication
package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

type UserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func AddNewUserRequest(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, request_http *http.Request) {
		var request UserRequest
		if err := json.NewDecoder(request_http.Body).Decode(&request); err != nil {
			// returns http Error response
			http.Error(writer, "Invalid Request Body", http.StatusBadRequest)
			return
		}

		if request.Username == "" || request.Password == "" {
			http.Error(writer, "Invalid Username and Password", http.StatusBadRequest)
			return
		}

		//sql query to see if username already EXISTS in database
		query := `SELECT username FROM users WHERE username = ?`
		result := db.QueryRow(query, request.Username)
		err := result.Scan()

		if err == sql.ErrNoRows {
			//okay
		} else {
			http.Error(writer, "Username already exists", http.StatusBadRequest)
			return
		}

		//sql command to enter (username, password) into users.db
		query = `INSERT INTO users (username, password) VALUES (?, ?)`
		hashed, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(writer, "Failed to generate hash", http.StatusInternalServerError)
			return
		}

		_, err = db.Exec(query, request.Username, hashed)
		if err != nil {
			http.Error(writer, "Failed to add new user", http.StatusInternalServerError)
			return
		}

		writer.WriteHeader(http.StatusCreated)
		writer.Write([]byte("User account created"))
	}
}

func UserSignIn(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, request_http *http.Request) {
		var request UserRequest
		if err := json.NewDecoder(request_http.Body).Decode(&request); err != nil {
			http.Error(writer, "Invalid Request Body", http.StatusBadRequest)
			return
		}

		if request.Username == "" || request.Password == "" {
			http.Error(writer, "Invalid Username and Password", http.StatusBadRequest)
			return
		}

		query := `SELECT username FROM users WHERE username = ?`
		result := db.QueryRow(query, request.Username)
		err := result.Scan()

		if err == sql.ErrNoRows {
			http.Error(writer, "Username not found", http.StatusBadRequest)
			return
		}

		query = `SELECT password FROM users WHERE username = ?`
		result = db.QueryRow(query, request.Username)

		var hashed []byte
		result.Scan(&hashed)
		err = bcrypt.CompareHashAndPassword(hashed, []byte(request.Password))

		if err != nil {
			http.Error(writer, "Password did not match", http.StatusBadRequest)
			return
		}

		writer.WriteHeader(http.StatusOK)
		writer.Write([]byte("Successful login"))
	}
}
