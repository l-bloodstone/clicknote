(function (){
    const noteId = document.querySelector("#noteId")
    const password = document.querySelector("#password")
    const createButton = document.querySelector("#create_button")

    async function getPassHash(password) {
        const hash = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(password))
        return new Uint8Array(hash).toBase64()
    }


    createButton.addEventListener("click", async ()=> {
        const passHash = await getPassHash(password.value)
        const res = await fetch("/create_note", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({noteId: noteId.value.trim(), passHash: passHash})
        })

        if (res.status === 503) {
            alert("Choose a different note name and try again!")
        } else if (res.status !== 200) {
            alert("Note couldn't be created!")
        } else {
            alert("Note created! Login to get your note")
            window.location.replace("/")
        }
    })

})()
