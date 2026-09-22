package main

import (
	"flag"
	"fmt"
	"net/http"
	"strconv"

	"database/sql"

	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)



func main() {
	// command-line flag for setting a static directory for the client(browser)
	staticDir := flag.String("static-dir", "../public/", "Relative path to the static dir",)
	port := flag.Int("port", 2233, "set Port")
	if (*port > 65535) {
		panic("Cannot use port number more than 65535")
	}
	flag.Parse()

	// setting gin mode to release mode and creating a new server
	gin.SetMode(gin.ReleaseMode)
	app := gin.New()

	app.Static("/", *staticDir)

	// seeting the database
	// NOTE: I chose sqlite3 for its simplicity it can be any sql database
	//		 but you have to set the database in the next line
	db, errDb := sql.Open("sqlite3", "./notes.db")
	defer db.Close()
	if errDb != nil {
		panic(errDb)
	}

	if _, err := db.Exec("create table if not exists note (noteId text primary key, passhash text, salt text, data text)"); err != nil {
		panic(err)
	}


	type NoteRequest struct {
		NodeId string `json:"noteId"`
		PassHash string `json:"passHash"`
		Salt string `json:"salt"`
	}

	type UpdateNoteRec struct {
		NoteId string `json:"noteId"`
		PassHash string `json:"passHash"`
		Data string `json:"data"`
		Salt string `json:"salt"`
	}

	type Note struct {
		NoteId string `json:"noteId"`
		Data string `json:"data"`
	}

	type SaltRequest struct {
		NoteId string `json:"noteId"`
	}

	app.POST("/get_salt", func(c *gin.Context) {
		var saltStore string
		sr := SaltRequest{}
		if err := c.ShouldBindBodyWithJSON(&sr); err != nil {
			c.JSON(401, gin.H{"status": "Invalid Information"})
		}

		row := db.QueryRow("select salt from note where noteId = ?", sr.NoteId)
		if err := row.Scan(&saltStore); err != nil {
			c.JSON(503, gin.H{"status": "Failed! Server Error"})
		}

		c.JSON(200, gin.H{"salt": saltStore})
	})

	app.POST("/get_note", func (c *gin.Context) {
		noteR := NoteRequest{}
		if err := c.ShouldBindBodyWithJSON(&noteR); err != nil {
			c.Status(401)
			return
		}
		row := db.QueryRow("select noteId, data from note where noteId = ? and passhash = ?", noteR.NodeId, noteR.PassHash)
		n := Note{}
		if err := row.Scan(&n.NoteId, &n.Data); err != nil {
			c.JSON(404, gin.H{"status": "Failed! Not Found"})
			return
		}
		c.JSON(200, n)
	})

	app.POST("/create_note", func(c *gin.Context) {
		noteR := NoteRequest{}
		if err := c.ShouldBindBodyWithJSON(&noteR); err != nil {
			c.JSON(401, gin.H{"status": "Failed! Invalid Info."})
			return
		}

		_, err := db.Exec("insert into note values(?, ?, ?, ?)", noteR.NodeId, noteR.PassHash, noteR.Salt, "")
		if err != nil {
			c.JSON(503, gin.H{"status": "Failed to Create, Server Error."})
			return
		}
	})

	app.PUT("/save_note", func (c *gin.Context) {

		snr := UpdateNoteRec{}

		if err := c.ShouldBindBodyWithJSON(&snr); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"status": "Invalid Information"})
			return
		}

		row := db.QueryRow("select noteId from note where noteId = ? and passHash = ?", snr.NoteId, snr.PassHash)
		note := Note{}
		if err := row.Scan(&note.NoteId); err != nil {
			c.JSON(503, gin.H{"status": "Invalid Information!"})
			return
		}

		if _, err := db.Exec("update note set data = ? where noteId = ?", snr.Data, snr.NoteId); err != nil {
			c.JSON(503, gin.H{"status": "failled! couldn't update note"})
			return
		}

		c.JSON(200, gin.H{"status": "success! note saved"})
	})

	fmt.Println("Server is Running at: http://localhost:" + strconv.Itoa(*port))
	app.Run(":" + strconv.Itoa(*port))
}
