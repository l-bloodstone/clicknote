const quill = new Quill('#editor', {
    modules: {
        syntax: true,
        toolbar: '#toolbar-container',
    },
    placeholder: 'Compose an epic...',
    theme: 'snow',
});


(async function (){ 

    const getDeltaButton = document.getElementById("get_note")
    const noteId = document.getElementById("note_id")
    const password = document.getElementById("password")
    const saveNote = document.getElementById("save_note")
    const savePassword = document.getElementById("save_password")
    const editButton = document.getElementById("edit")
    let savedNoteId = ""

    function deltaToJson(delta) {
        return JSON.stringify(delta)
    }

    function jsonToDelta(json) {
        return JSON.parse(json)
    }

    async function getPassHash(password) {
        const hash = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(password))
        return new Uint8Array(hash).toBase64()
    }

    async function getKey(password) {
        // 1. Import password
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            "PBKDF2",
            false,
            ["deriveKey"]
        );

        // 2. Generate a proper random salt
        const salt = new Uint8Array(crypto.getRandomValues(new Uint8Array(16)))
        const iv = new Uint8Array(crypto.getRandomValues(new Uint8Array(16)))

        // 3. Derive the key
        const key = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 500_000,
                hash: "SHA-256"          // or "SHA-512"
            },
            keyMaterial,
            {
                name: "AES-CBC",
                length: 256
            },
            false,                     // better to keep non-extractable
            ["encrypt", "decrypt"]
        );

        return { key, salt, iv };        // return salt so you can store it
    }

    async function encryptText(text, password) {
        const { key, salt, iv } = await getKey(password)
        let t = await crypto.subtle.encrypt({
            name: "AES-CBC",
            iv: iv
        }, key, Uint8Array.from(text, c => c.charCodeAt(0)))

        t = new Uint8Array(t)

        let buf = new Uint8Array(salt.byteLength + iv.byteLength + t.byteLength)


        buf.set(salt, 0)
        buf.set(iv, salt.byteLength)
        buf.set(t, salt.byteLength + iv.byteLength)

        return buf.toBase64()
    }

    async function decryptText(encryptText, password) {
        let encryptTextUint8 = Uint8Array.fromBase64(encryptText)
        const salt = encryptTextUint8.slice(0, 16)
        const iv = encryptTextUint8.slice(16, 32)
        const text = encryptTextUint8.slice(32)

        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            "PBKDF2",
            false,
            ["deriveKey"]
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 500_000,
                hash: "SHA-256"          // or "SHA-512"
            },
            keyMaterial,
            {
                name: "AES-CBC",
                length: 256
            },
            false,                     // better to keep non-extractable
            ["encrypt", "decrypt"]
        );
        const decryptedData = await crypto.subtle.decrypt({
            name: "AES-CBC",
            iv: iv,
        },
            key,
            text
        )

        return new TextDecoder().decode(decryptedData)
    }


    getDeltaButton.addEventListener("click", async ()=> {

        const res = await fetch("/get_note", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({noteId: noteId.value.trim(), passHash: await getPassHash(password.value)})
        })

        if (res.status !== 200) {
            alert("Note Name or Password is wrong!")
            return
        } else {

            const dataRes = await res.json()
            
            savedNoteId = noteId.value
            saveNote.removeAttribute("hidden")
            editButton.removeAttribute("hidden")
            savePassword.removeAttribute("hidden")
            document.getElementById("standalone-container").removeAttribute("hidden")
            noteId.remove()
            password.remove()
            getDeltaButton.remove()
            
            // if note data is empty do not attempt to decrypt it
            if (dataRes.data != null || dataRes.data.length > 0) {
                const decryptedText = await decryptText(dataRes.data, password.value)
                const delta = await jsonToDelta(decryptedText)
                quill.setContents(delta)
                quill.disable()
            }
            
        }
    })

    saveNote.addEventListener("click", async ()=> {
        if (savePassword.value.length < 4) {
            alert("Invalid Password")
            return
        }
        const delta = quill.getContents()
        const deltaJson = deltaToJson(delta)
        const encText = await encryptText(deltaJson, savePassword.value)
        const res = await fetch("/save_note", {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                noteId: savedNoteId,
                passHash: await getPassHash(savePassword.value),
                data: encText
            })
        })
        savePassword.value = ""
        if (res.status !== 200) {
            alert("Note couldn't be saved")
            return
        }
        alert("Note Saved! 🎉")
    })

    editButton.addEventListener("click", function() {
        quill.enable()
    })
})()
