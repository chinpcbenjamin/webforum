package db

import (
	"database/sql"
	"fmt"
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

	_, err = database.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		log.Fatal(err)
	}
	var fkEnabled int
	row := database.QueryRow("PRAGMA foreign_keys;")
	err = row.Scan(&fkEnabled)
	fmt.Println(err)
	if fkEnabled == 1 {
		fmt.Println("Foreign keys are enabled.")
	} else {
		fmt.Println("Foreign keys are disabled.")
	}

	createTable := `CREATE TABLE IF NOT EXISTS users (
		username TEXT PRIMARY KEY,
		password TEXT NOT NULL
	);`

	if _, err := database.Exec(createTable); err != nil {
		log.Fatal(err)
	}

	createTable = `CREATE TABLE IF NOT EXISTS posts (
		postid INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT NOT NULL,
		username TEXT NOT NULL
			REFERENCES users (username),
		category TEXT NOT NULL,
		keywords TEXT NOT NULL,
		description TEXT NOT NULL,
		timing TIMESTAMP NOT NULL
	);`

	if _, err := database.Exec(createTable); err != nil {
		log.Fatal(err)
	}

	createTable = `CREATE TABLE IF NOT EXISTS comments (
		commentid INTEGER PRIMARY KEY AUTOINCREMENT,
		post INTEGER NOT NULL
			REFERENCES posts (postid)
			ON DELETE CASCADE,
		commenter TEXT NOT NULL
			REFERENCES users (username),
		comment TEXT NOT NULL,
		timing TIMESTAMP NOT NULL
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
