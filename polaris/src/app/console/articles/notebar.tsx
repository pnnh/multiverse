import {useEffect, useState} from 'react'
import {useRecoilValue, useSetRecoilState} from 'recoil'
import {libraryAtom, noteAtom, notebookAtom} from './providers/notebook'
import React from 'react'
import './notebar.scss'
import {PLSelectResult} from "@/models/common/protocol";
import {PSNoteModel} from "@/models/common/personal/note";
import {selectNotes} from "@/services/client/console/personal/notes";

export function ConsoleNotebar() {
    const [notesResult, setNotesResult] = useState<PLSelectResult<PSNoteModel>>()
    const libraryState = useRecoilValue(libraryAtom)
    const notebookState = useRecoilValue(notebookAtom)
    useEffect(() => {
        if (!libraryState || !libraryState.current || !libraryState.current.urn || !notebookState ||
            !notebookState.current || !notebookState.current.urn) {
            return
        }
        selectNotes(libraryState.current.urn, notebookState.current.urn).then(selectResult => {
            setNotesResult(selectResult)
        })
    }, [notebookState])

    if (!notesResult || !notesResult.data || !notesResult.data.range || notesResult.data.range.length <= 0) {
        return <div>Empty</div>
    }
    return <div className={'noteList'}>
        {
            notesResult.data.range.map(item => {
                return <NoteCard key={item.urn} item={item}/>
            })
        }
    </div>
}

function NoteCard({item}: { item: PSNoteModel }) {
    const setNote = useSetRecoilState(noteAtom)

    return <div className={'noteCard'} onClick={() => {
        setNote({
            current: item
        })
    }}>
        <div className={'noteSelf'}>
            <div className={'noteName'}>
                {item.title}</div>
        </div>
    </div>
}
