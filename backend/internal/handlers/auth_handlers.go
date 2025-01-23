// this handles functions/requests related to user authentication
package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/chinpcbenjamin/webforum/backend/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

type UserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type VerifyRequest struct {
	Token string `json:"token"`
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
			http.Error(writer, "Username already exists", http.StatusConflict)
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
			http.Error(writer, "Username not found", http.StatusUnauthorized)
			return
		}

		query = `SELECT password FROM users WHERE username = ?`
		result = db.QueryRow(query, request.Username)

		var hashed []byte
		result.Scan(&hashed)
		err = bcrypt.CompareHashAndPassword(hashed, []byte(request.Password))

		if err != nil {
			http.Error(writer, "Password did not match", http.StatusUnauthorized)
			return
		}

		// user authenticated. generate token, then add cookies
		jwtToken, err := utils.CreateToken(request.Username)
		if err != nil {
			http.Error(writer, "Failed to add new user", http.StatusInternalServerError)
			return
		}

		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusOK)
		json.NewEncoder(writer).Encode(map[string]string{
			"token": jwtToken,
		})
	}
}

func VerifyUser(db *sql.DB) http.HandlerFunc {
	return func(writer http.ResponseWriter, request_http *http.Request) {
		var request VerifyRequest
		if err := json.NewDecoder(request_http.Body).Decode(&request); err != nil {
			http.Error(writer, "Invalid Request Body", http.StatusBadRequest)
			return
		}

		if utils.VerifyToken(request.Token) {
			user := utils.RetrieveUserFromToken(request.Token)
			writer.Header().Set("Content-Type", "application/json")
			writer.WriteHeader(http.StatusOK)
			json.NewEncoder(writer).Encode(map[string]string{
				"username": user,
			})
		} else {
			writer.WriteHeader(http.StatusUnauthorized)
		}
	}
}
