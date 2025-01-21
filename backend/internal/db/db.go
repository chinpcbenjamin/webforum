package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var database *sql.DB

func Initialise_Database() {
	var err error
	database, err = sql.Open("sqlite3", "./forum.db")

	// if there is an error opening the database
	if err != nil {
		log.Fatal(err)
	}

	createTable := `CREATE TABLE IF NOT EXISTS users (
		username TEXT PRIMARY KEY NOT NULL,
		password TEXT NOT NULL
	);`

	if _, err := database.Exec(createTable); err != nil {
		log.Fatal(err)
	}

	createTable = `CREATE TABLE IF NOT EXISTS posts (
		title TEXT NOT NULL,
		username TEXT NOT NULL
			REFERENCES users (username),
		category TEXT NOT NULL,
		keywords TEXT NOT NULL,
		description TEXT NOT NULL,
		timing TIMESTAMP NOT NULL,
		PRIMARY KEY (title, username)
	);`

	if _, err := database.Exec(createTable); err != nil {
		log.Fatal(err)
	}

	createTable = `CREATE TABLE IF NOT EXISTS comments (
		commenter TEXT NOT NULL
			REFERENCES users (username),
		comment TEXT NOT NULL,
		timing TIMESTAMP NOT NULL,
		title TEXT NOT NULL,
		username TEXT NOT NULL,
		FOREIGN KEY (title, username)
			REFERENCES posts (title, username)
			ON DELETE CASCADE
			ON UPDATE CASCADE,
		PRIMARY KEY (commenter, timing, title, username)
	);`

	if _, err := database.Exec(createTable); err != nil {
		log.Fatal(err)
	}
}

func Close_Database() {
	if database != nil {
		database.Close()
	}
}

func Get_Database() *sql.DB {
	return database
}

func Query_User_Exists(username string) bool {
	row := database.QueryRow(`SELECT username FROM users WHERE username = ?`, username)
	var name string
	err := row.Scan(&name)
	return err == nil
}
