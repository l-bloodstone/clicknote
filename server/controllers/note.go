package controllers

import (
	"server/dab"
	"github.com/gin-gonic/gin"
)

var db = dab.GetDB()

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

func GetSalt(c *gin.Context) {
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
}

func GetNote(c *gin.Context) {
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
}

func CreateNote(c *gin.Context) {
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
}

func SaveNote(c *gin.Context) {

	snr := UpdateNoteRec{}

	if err := c.ShouldBindBodyWithJSON(&snr); err != nil {
		c.JSON(401, gin.H{"status": "Invalid Information"})
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
}
