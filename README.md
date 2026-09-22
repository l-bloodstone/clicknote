# clickNote
## A minimal end-to-end encrypted note app with rich text editor powered by Quill.js

### Features:
- End-to-End encrypted conpletely on the frontend, data won't get to the server unencrypted
- Rich-Text editor using Quill.js
- supports embeded photos and videos

### Installation:
- just clone the repo
- run in command-line `make run`

#### *NOTE: As an offline maniac I've bundled the dependencies in the repo using `go mod vendor`. It is for easy installation. Just need a `go` compiler.*

#### *NOTE: The UI is horrible, no CSS at all. As an back-end developer I loath nothing more than CSS and Browser APIs. But encryption make sense in the client side, so I had no choice but to do the absolute essentials.

### Sequence Diagram for Easy Visualization:

![creating note](./assets/creating_note.svg)
![gettting note](./assets/getting_note.svg)
![saving note](./assets/saving_note.svg)
