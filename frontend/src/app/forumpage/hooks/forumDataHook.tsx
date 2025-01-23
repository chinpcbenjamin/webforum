import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Typography, List, ListSubheader, ListItemButton, ListItemIcon, ListItemText, Divider } from "@mui/material"
import { AccountCircle, WebStories, Logout, RestartAlt } from "@mui/icons-material"

export default function ForumDataHook() {
    const router = useRouter()

    const [user, setUser] = useState<string>('')

    const [data, setData] = useState<any[]>([])
    const [postColours, setPostColours] = useState<string[]>([])
    const bgColors : string[] = ['yellowgreen', 'wheat', 'turquoise', 'thistle', 'tan', 'skyblue', 'powderblue', 'plum', 'palevioletred', 'olive']

    const [currPostIndex, setCurrPostIndex] = useState<number>(0)
    const [commentText, setCommentText] = useState<string>('')
    const [commentData, setCommentData] = useState<any[]>([])
    const [commentError, setCommentError] = useState<boolean>(false)

    const [userView, setUserView] = useState<boolean>(false)

    const [loading, setLoading] = useState<boolean>(false)

    const [errorPopup, setErrorPopup] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')

    useEffect(() => {
        const verify_user : () => void = async () => {
            try {
                const response = await fetch("http://localhost:3001/verify", {
                    method: "POST",
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({
                        "token": localStorage.getItem("token")
                    })
                })
    
                if (!response.ok) {
                    alert("Error. Invalid sign in credentials. Please sign in again.")
                    router.push("../")
                } else {
                    const a = await response.json()
                    setUser(a.username)
                }
            } catch (error) {
                setErrorPopup(true)
                setErrorMessage('Unknown Error detected.')
            }
        }
        verify_user()
    }, [])

    const retrieveForumData : () => void = async () => {
        try {
            setLoading(true)
            const response = await fetch("http://localhost:3001/get-forum-data", {
                method: "GET",
            })
            if (response.ok) {
                const a = await response.json()
                console.log(a.data)
                setData(a.data)
                a.data.forEach((x : any) => postColours.push(bgColors[Math.floor(Math.random() * 10)]))
            } else if (response.status == 404) {
                setData([])
            } else if (response.status == 500) {
                setErrorMessage("Internal Server Error when fetching data.")
                setErrorPopup(true)
            }
        } catch (error) {
            setErrorMessage("No posts have been made yet. Why not be the first?")
            setErrorPopup(true)
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 2000);
        }
    }

    useEffect(() => {
        retrieveForumData()
    }, [])

    const handleNewComment = async (index : number) => {
        if (commentText.trim() == "") {
            setCommentError(true)
        } else {
            try {
                setLoading(true)
                const response = await fetch("http://localhost:3001/new-comment", {
                    method: "POST",
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({
                        "postID" : data[index].postid,
                        "commenter" : user,
                        "comment" : commentText.trim(),
                    })
                })

                if (response.ok) {
                    setCommentText('')
                    getCurrPostComments(index)
                    setCommentError(false)
                } else {
                    setCommentError(true)
                }
            } catch (error) {
                setErrorMessage("Unknown error: " + error as string )
                setErrorPopup(true)
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 2000);
            }
        }
    }

    const getCurrPostComments = async (index : number) => {
        if (!data[currPostIndex]) {
            return
        }
        try {
            setLoading(true)
            const response = await fetch(`http://localhost:3001/get-comments?postID=${data[index].postid}`, {
                method: "GET"
            })
            if (response.ok) {
                const a = await response.json()
                setCommentData(a.data)
                return true
            } else {
                setCommentData([])
                return false
            }
        } catch (error) {
            setErrorMessage("Unknown error: " + error as string )
            setErrorPopup(true)
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 2000);
        }
    }

    const deletePost = async (index : number) => {
        if (!data[currPostIndex]) {
            return
        }
        try {
            setLoading(true)
            const response = await fetch(`http://localhost:3001/delete-post?postID=${data[index].postid}`, {
                method: "DELETE"
            })
            if (response.ok) {
                setUserView(false)
                retrieveForumData()
            } else {
                setErrorMessage("Failed to delete post. Please try again later")
                setErrorPopup(true)
            }
        } catch (error) {
            setErrorMessage("Unknown error: " + error as string )
            setErrorPopup(true)
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 2000);
        }
    }

    const filterPosts = async (keywords : string, filterArray : boolean[]) => {
        const transformedArray = filterArray.map(x => x ? "1" : "0").join()
        try {
            setLoading(true)
            const response = await fetch(`http://localhost:3001/filtered-posts?keywords=${keywords}&category=${transformedArray}`, {
                method: "GET"
            })
            if (response.status == 404) {
                setData([])
            } else if (response.ok) {
                const a = await response.json()
                setData(a.data)
                a.data.forEach((x : any) => postColours.push(bgColors[Math.floor(Math.random() * 10)]))
            } else if (response.status == 500) {
                setErrorMessage("Internal Server Error. Please try again later")
                setErrorPopup(true)
            }
        } catch (error) {
            setErrorMessage("Unknown error: " + error as string )
            setErrorPopup(true)
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 2000);
        }
    }

    const userPosts = async () => {
        try {
            setLoading(true)
            const response = await fetch(`http://localhost:3001/user-posts?user=${user}`, {
                method: "GET",
            })
            if (response.status == 404) {
                setData([])
            } else if (response.ok) {
                const a = await response.json()
                setData(a.data)
                a.data.forEach((x : any) => postColours.push(bgColors[Math.floor(Math.random() * 10)]))
            } else if (response.status == 500) {
                setErrorMessage("Internal Server Error. Please try again later")
                setErrorPopup(true)
            }
        } catch (error) {
            setErrorMessage("Unknown error: " + error as string )
            setErrorPopup(true)
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 2000);
        }
    }

    const deleteComment = async (index : number) => {
        if (!commentData[index]) {
            return
        } else {
            try {
                setLoading(true)
                const response = await fetch(`http://localhost:3001/delete-comment?commentID=${commentData[index].commentID}`, {
                    method: "DELETE"
                })
                if (response.ok) {
                    getCurrPostComments(currPostIndex)
                } else {
                    setErrorMessage("Failed to delete comment. Please try again later")
                    setErrorPopup(true)
                }
            } catch (error) {
                setErrorMessage("Unknown error: " + error as string )
                setErrorPopup(true)
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 2000);
            }
        }
    }

    const updateComment = async (index : number) => {
        if (!commentData[index]) {
            return
        } else if (commentText.trim() == "") {
            setCommentError(true)
        } else {
            try {
                const response = await fetch("http://localhost:3001/update-comment", {
                    method: "PATCH",
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({
                        "commentID" : commentData[index].commentID,
                        "comment" : commentText.trim()
                    })
                })

                if (response.ok) {
                    getCurrPostComments(currPostIndex)
                } else if (response.status == 400) {
                    setErrorMessage("Invalid comment")
                    setErrorPopup(true)
                } else if (response.status == 500) {
                    setErrorMessage("Internal Server Error. Please try again later")
                    setErrorPopup(true)
                }
            } catch (error) {
                setErrorMessage("Unknown error: " + error as string )
                setErrorPopup(true)
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 2000);
            }
        }
    }

    const drawerList = (
        <Box sx={{width: 200}} className='flex flex-col'>
            <Box className='flex flex-row m-3'>
                <AccountCircle sx={{width: 36, height: 36}}/>
                <Typography sx={{paddingLeft:2, paddingTop: 1}}>{user}</Typography>
            </Box>
            <Divider/>
            <List
                subheader={
                    <ListSubheader>
                        Settings
                    </ListSubheader>
                }>
                <ListItemButton className="mx-2 mb-2" onClick={() => { retrieveForumData(); setUserView(false) }}>
                    <ListItemIcon>
                        <RestartAlt sx={{width: 36, height: 36}}/>
                    </ListItemIcon>
                    <ListItemText>
                        Reset Search
                    </ListItemText>
                </ListItemButton>

                <ListItemButton className="mx-2 mb-2" onClick={() => { userPosts(); setUserView(true) }}>
                    <ListItemIcon>
                        <WebStories sx={{width: 36, height: 36}}/>
                    </ListItemIcon>
                    <ListItemText>
                        View Your Posts
                    </ListItemText>
                </ListItemButton>

                <ListItemButton className="m-2" onClick={() => {localStorage.removeItem('token')  ; router.push("/")}}>
                    <ListItemIcon>
                        <Logout sx={{width: 36, height: 36}}/>
                    </ListItemIcon>
                    <ListItemText>
                        Sign Out
                    </ListItemText>
                </ListItemButton>
            </List>
        </Box>
    )

    return { user, data, postColours, retrieveForumData, drawerList, currPostIndex, setCurrPostIndex,
        commentText, setCommentText, commentData, setCommentData, commentError, setCommentError, handleNewComment,
        getCurrPostComments, filterPosts, userView, deletePost, loading, setLoading, errorPopup, setErrorPopup,
        errorMessage, setErrorMessage, deleteComment, updateComment
     }
}