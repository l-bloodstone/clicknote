(function (){
    const noteId = document.querySelector("#noteId")
    const password = document.querySelector("#password")
    const createButton = document.querySelector("#create_button")

    function generateSalt() {
        return crypto.getRandomValues(new Uint8Array(32))
    }

    async function getPassHash(password) {
        const salt = generateSalt()
        const hash = await scrypt.scrypt(
            new TextEncoder().encode(password),
            salt,
            4096, 16, 2, 64
        )
        return { passHash: hash.toBase64(), salt: salt.toBase64() }
    }

    createButton.addEventListener("click", async ()=> {
        createButton.setAttribute("disabled", true)
        if (password.value.length < 6) {
            alert("Provide a password which is at least 6 characters")
            createButton.removeAttribute("disabled")
            return
        }
        const {passHash, salt} = await getPassHash(password.value)
        const res = await fetch("/create_note", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({noteId: noteId.value.trim(), passHash, salt})
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
