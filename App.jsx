import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { nanoid } from "nanoid"
import {onSnapshot, addDoc, doc, deleteDoc, setDoc} from "firebase/firestore"
import { notesCollection, db } from "./firebase"


export default function App() {
    const [notes, setNotes] = React.useState([])
    console.log("this is notes"+ notes)
    
    const [currentNoteId, setCurrentNoteId] = React.useState("")
    console.log("this is the currentNoteId" +currentNoteId)

    const currentNote = 
        notes.find(note => note.id === currentNoteId) 
        || notes[0]

    const sortedNotes = notes.sort((a, b)=> b.updatedAt - a.updatedAt)

    console.log("This is sortedNotes" +sortedNotes)

    const [tempNoteText, setTempNoteText] = React.useState('')

    React.useEffect(() => {
        const unsubscribe = onSnapshot(notesCollection, function(snapshot) {
            // Sync up our local notes array with the snapshot data
            const notesArr = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }))
            console.log("this is notesArr" +notesArr)
            setNotes(notesArr)
        })
        return unsubscribe
    }, [])

    

    React.useEffect(()=> {
        if(!currentNoteId){
            setCurrentNoteId(notes[0]?.id)
        }
    }, [notes])

    React.useEffect(()=>{
        if(currentNote){
            setTempNoteText(currentNote.body)
        }
    },[currentNote])

    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here",
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        const newNoteRef = await addDoc(notesCollection, newNote)
        setCurrentNoteId(newNoteRef.id)
        
    }

    async function updateNote(text) {
      const docRef = doc(db, "notes", currentNoteId)
      await setDoc(docRef, {body: text, updatedAt: Date.now()}, {merge: true})
        
    }

    async function deleteNote(noteId) {
        const docRef = doc(db, "notes", noteId )
        await deleteDoc(docRef)
    }

    return (
        <main>
            {
                notes.length > 0
                    ?
                    <Split
                        sizes={[30, 70]}
                        direction="horizontal"
                        className="split"
                    >
                        <Sidebar
                            currentNote={currentNote}
                            notes={sortedNotes}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                        <Editor
                            tempNoteText={tempNoteText}
                            setTempNoteText={setTempNoteText}
                        />
                    
                    </Split>
                    :
                    <div className="no-notes">
                        <h1>You have no notes</h1>
                        <button
                            className="first-note"
                            onClick={createNewNote}
                        >
                            Create one now
                </button>
                    </div>

            }
        </main>
    )
}
