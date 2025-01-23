// this is the entry point to the backend system
// access user database, access posts database, handle user registration, user login, CRUD requests

package main

import (
	"log"
	"net/http"
	"os"

	"github.com/chinpcbenjamin/webforum/backend/internal/db"
	"github.com/chinpcbenjamin/webforum/backend/internal/handlers"
	"github.com/joho/godotenv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func main() {
	godotenv.Load(".env")
	secret_jwt_key := os.Getenv("JWT_SECRET")
	if secret_jwt_key == "" {
		log.Fatal("no JWT key")
	}

	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"POST", "GET", "DELETE", "PATCH"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Server is running"))
	})

	db.Initialise_Database()
	r.Post("/new-user", handlers.AddNewUserRequest(db.Get_Database()))
	r.Post("/sign-in", handlers.UserSignIn(db.Get_Database()))
	r.Post("/verify", handlers.VerifyUser(db.Get_Database()))
	r.Post("/new-post", handlers.AddNewPost(db.Get_Database()))
	r.Post("/new-comment", handlers.AddNewComment(db.Get_Database()))

	r.Get("/get-forum-data", handlers.GetAllForumData(db.Get_Database()))
	r.Get("/filtered-posts", handlers.GetFilteredForumData(db.Get_Database()))
	r.Get("/get-comments", handlers.GetCommentsForPost(db.Get_Database()))
	r.Get("/user-posts", handlers.GetUserForumPosts(db.Get_Database()))

	r.Delete("/delete-post", handlers.DeleteForumPost(db.Get_Database()))
	r.Delete("/delete-comment", handlers.DeleteComment(db.Get_Database()))

	r.Patch("/update-post", handlers.UpdatePost(db.Get_Database()))

	http.ListenAndServe(":3001", r)
}
