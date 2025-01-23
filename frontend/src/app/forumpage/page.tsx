'use client'

import React, { useState } from "react"
import { Typography, Container, Button, TextField, InputAdornment, Drawer, Box, List, Dialog, DialogTitle, FormControl, RadioGroup, Radio, FormControlLabel,
    Stack, Chip, DialogActions, Alert, AlertTitle, ListItem, Paper, Menu, Checkbox, FormGroup, Avatar, 
    Backdrop,
    CircularProgress} from "@mui/material"
import { AddBox, AddComment, Close, DeleteOutline, Description, EditNote, Forum, Search, Send, Settings, Title, Tune } from "@mui/icons-material"
import ForumDataHook from "./hooks/forumDataHook"

export default function forum() {
    const { user, data, postColours, retrieveForumData, drawerList, currPostIndex, setCurrPostIndex,
        commentText, setCommentText, commentData, setCommentData, commentError, setCommentError, handleNewComment,
        getCurrPostComments, filterPosts, userView, deletePost, loading, setLoading, errorPopup, setErrorPopup,
        errorMessage, setErrorMessage, deleteComment, updateComment } = ForumDataHook()

    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

    const [popup, setPopup] = useState<string>('')

    const [title, setTitle] = useState<string>('')
    const [category, setCategory] = useState<string>('Suggestion')
    const [description, setDescription] = useState<string>('')
    const [keywords, setKeywords] = useState<string[]>([])
    const [keywordsText, setKeywordsText] = useState<string>('')
    const [newPostError, setNewPostError] = useState<boolean>(false)

    const [filterMenuAnchor, setFilterMenuAnchor] = useState<null|HTMLElement>(null)
    const [filterArray, setFilterArray] = useState<boolean[]>([false, false, false])

    const [searchBar, setSearchBar] = useState<string>('')

    const [deleteAlert, setDeleteAlert] = useState<boolean>(false)

    const [updateMode, setUpdateMode] = useState<boolean>(false)

    const [delCommentPopup, setDelCommentPopup] = useState<boolean>(false)
    const [delMenuAnchor, setDelMenuAnchor] = useState<null|HTMLElement>(null)
    const [commentTarget, setCommentTarget] = useState<number>(0)

    const [updateCommentMode, setUpdateCommentMode] = useState<boolean>(false)

    const handlePostClick = async (index : number) => {
        setCurrPostIndex(index);
        await getCurrPostComments(index);
        setPopup("post");
    }

    const handleNewPost : () => void = async () => {
        if (title.trim() == '' || description.trim() == '' || keywords.length == 0) {
            setNewPostError(true)
            return
        } else {
            try {
                setLoading(true)
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/new-post`, {
                    method : "POST",
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({
                        'title': title.trim(),
                        'username' : user,
                        'category' : category,
                        'keywords' : keywords.reduce((a, b) => a.concat(',').concat(b)),
                        'description' : description.trim()
                    })
                })

                if (response.ok) {
                    setPopup('')
                    setTitle('')
                    setCategory('Suggestion')
                    setDescription('')
                    setKeywords([])
                    setKeywordsText('')
                    retrieveForumData()
                } else if (response.status == 400) {
                    setErrorPopup(true)
                    setErrorMessage("Invalid request body. Please check that your fields are valid")
                    setNewPostError(true)
                } else if (response.status == 409) {
                    setErrorPopup(true)
                    setErrorMessage("Another post that you have made has the same title. Please choose another title.")
                } else if (response.status == 500) {
                    setErrorPopup(true)
                    setErrorMessage('Internal Server Error. Please try again later.')
                }
            } catch (error) {
                setErrorPopup(true)
                setErrorMessage(error as string)
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 2000);
            }
        }
    }

    const updatePost = async () => {
        if (title.trim() == '' || description.trim() == '' || keywords.length == 0) {
            setNewPostError(true)
            return
        } else {
            try {
                setLoading(true)
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-post`, {
                    method : "PATCH",
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({
                        'postID' : data[currPostIndex].postid,
                        'title': title.trim(),
                        'category' : category,
                        'keywords' : keywords.reduce((a, b) => a.concat(',').concat(b)),
                        'description' : description.trim()
                    })
                })
                if (response.ok) {
                    setPopup('')
                    setTitle('')
                    setCategory('Suggestion')
                    setDescription('')
                    setKeywords([])
                    setKeywordsText('')
                    retrieveForumData()
                } else if (response.status == 400) {
                    setErrorPopup(true)
                    setErrorMessage("Invalid request body. Please check that your fields are valid")
                    setNewPostError(true)
                } else if (response.status == 500) {
                    setErrorPopup(true)
                    setErrorMessage('Internal Server Error. Please try again later.')
                }
            } catch (error) {
                console.error(error)
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 2000);
            }
        }
    }

    const handleConfirmDelete = async (index : number) => {
        console.log(index, currPostIndex)
        await deletePost(index)
        setPopup('')
        setDeleteAlert(false)
    }

    const handleUpdatePress = () => {
        setUpdateMode(true)
        setTitle(data[currPostIndex].title)
        setCategory(data[currPostIndex].category)
        setKeywords(data[currPostIndex].keywords.split(","))
        setDescription(data[currPostIndex].description)
        setPopup("newPost")
    }

    const cancelUpdatePress = () => {
        setUpdateMode(false)
        setTitle('')
        setCategory('Suggestion')
        setKeywords([])
        setDescription('')
        setPopup('post')
    }

    return (
        <Box sx={{minWidth:'100%', padding: 0, margin: 0}}>
            <Container className="flex flex-row justify-between items-center py-3 bg-blue-300" sx={{minWidth:'100%'}}>
                <Forum sx={{width: 36, height: 36, color:'white'}}/>
                <Typography variant="h5" className=" text-white font-bold">Benjamin's Forum</Typography>
                <Button onClick={() => setDrawerOpen(true)}>
                    <Settings sx={{width: 36, height: 36, color:"white"}}/>
                </Button>
            </Container>
            {/* <Box className={!userView ? 'flex flex-row' : "flex flex-row justify-end"}> */}
            <Box className='flex flex-row'>
                {
                    userView &&
                    <Typography variant="h6" className="font-bold my-5 mx-2 text-center" sx={{minWidth:"96%"}}>Your Posts</Typography>
                }
                {
                    !userView &&
                    <TextField
                        value={searchBar}
                        onChange={e => setSearchBar(e.target.value)}
                        className="my-5 pl-10 pr-1"
                        fullWidth
                        variant="outlined"
                        placeholder="Search for a topic by its title, or by its keywords"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Button color="inherit" size="large" onClick={e => {setFilterMenuAnchor(e.currentTarget) ; setPopup('filter')}}>
                                            <Tune/>
                                        </Button>
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button color='inherit' onClick={() => filterPosts(searchBar, filterArray)}>
                                            <Search/>
                                        </Button>
                                    </InputAdornment>
                                )
                            }
                        }}>
                    </TextField>
                }
                <Button onClick={() => setPopup('newPost')}>
                    <AddBox sx={{width: 36, height: 36, color:'#93c5fd'}}/>
                </Button>
            </Box>
            
            {/* List of Forum Content */}
            {
                <Box className="flex flex-row justify-center" sx={{minWidth:"100%"}}>
                    <List sx={{minWidth:"70%"}}>
                        {
                            data.length != 0 &&
                            data.map((x, index) => 
                                <ListItem key={index} sx={{justifyItems: 'center', minWidth:'100%', width:'100%'}}>
                                    <Paper className="rounded-xl p-3 text-white" elevation={5}
                                        onClick={() => { handlePostClick(index) }}
                                        sx={{minWidth:"100%", backgroundColor:postColours[index] }}>
                                        <Typography className="font-bold "variant="h3">{x.title}</Typography>
                                        <Typography className="mb-5" variant="body1">by: {x.username}</Typography>
                                        <Stack direction='row' spacing={1}>
                                            <Chip color="info" className="font-bold" label={x.category}></Chip>
                                        {
                                            String(x.keywords).split(",").map((y, id) => (
                                                <Chip sx={{backgroundColor:'whitesmoke'}} className="font-bold" key={id} label={y}></Chip>
                                            ))
                                        }
                                        </Stack>
                                        <Typography className="mt-2 italic" variant="body2">{new Date(x.time).toLocaleString()}</Typography>
                                    </Paper>
                                </ListItem>
                            )
                        }
                        {
                            data.length == 0
                            &&
                            <Typography className="italic">Looks like there are no search results! Search for something else instead!</Typography>
                        }
                    </List>
                </Box>
            }

            {/* Right Sidebar */}
            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                anchor="right">
                    {drawerList}    
            </Drawer>

            {/* Add a new post to the forum popup or update an existing post*/}
            {
                <Dialog open={popup == 'newPost'} maxWidth='lg' fullWidth>
                    <Box sx={{display: 'flex', justifyContent:'flex-end'}}>
                        {
                            !updateMode &&
                            <Button color='inherit' onClick={() => setPopup('')} sx={{justifySelf:'end'}}>
                                <Close/>
                            </Button>
                        }
                    </Box>
                    <Box className='p-5'>
                        <Box sx={{display: 'flex', justifyContent:'center'}}>
                            <DialogTitle className="font-bold">{ updateMode ? "Update Post" : "New Discussion" }</DialogTitle>
                        </Box>
                        <Box className='my-2'>
                            <Typography variant="body1" className="font-bold">Title</Typography>
                            <TextField size="small" placeholder="Enter Title" fullWidth value={title}
                                onChange={e => setTitle(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Title/>
                                            </InputAdornment>
                                        )
                                    }
                                }}>
                            </TextField>
                        </Box>

                        <Box className='my-10'>
                            <Typography variant="body1" className="font-bold">Category</Typography>
                            <FormControl>
                                <RadioGroup value={category} onChange={e => setCategory(e.target.value)} row defaultValue='Suggestion' sx={{gap:10}}>
                                    <FormControlLabel control={<Radio/>} value="Suggestion" label='Suggestion'/>
                                    <FormControlLabel control={<Radio/>} value="Problem" label='Problem'/>
                                    <FormControlLabel control={<Radio/>} value="General" label='General'/>
                                </RadioGroup>
                            </FormControl>
                        </Box>

                        <Box className='my-10'>
                            <Typography variant="body1" className="font-bold">Keywords</Typography>
                            <TextField size="small" placeholder="Enter keywords. Press enter to set keyword. No commas are allowed." fullWidth value={keywordsText}
                                error={keywordsText.includes(",")}
                                helperText={keywordsText != '' ? "Enter keywords. Press enter to set keyword. No commas are allowed." : ''}
                                onChange={e => setKeywordsText(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key == 'Enter' && keywordsText.trim() != '' && !keywordsText.includes(",")) {
                                        keywords.push(keywordsText.trim())
                                        setKeywordsText('')
                                    }
                                }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Description/>
                                            </InputAdornment>
                                        )
                                    }
                                }}>
                            </TextField>
                            {
                                keywords.length != 0 &&
                                <Stack direction='row' spacing={1} className="my-2">
                                    {
                                        keywords.map((x, index) => (
                                            <Chip key={index} label={x} onDelete={() => setKeywords(keywords.filter(y => y != x))}/>
                                        ))
                                    }
                                </Stack>
                            }
                        </Box>

                        <Box className='my-10'>
                            <Typography variant="body1" className="font-bold">Description</Typography>
                            <TextField size="small" placeholder="Provide a description" fullWidth multiline value={description}
                                onChange={e => setDescription(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Description/>
                                            </InputAdornment>
                                        )
                                    }
                                }}>
                            </TextField>
                        </Box>
                        {
                            newPostError &&
                            <Alert severity="error">
                                <AlertTitle>Error creating new post:</AlertTitle>
                                <Typography variant="body2">Please ensure that you have a title, description, and at least one keyword tag that allows people
                                    to search for this topic.
                                </Typography>
                            </Alert>
                        }
                        <Box>
                            <DialogActions>
                                {
                                    updateMode &&
                                    <Button onClick={cancelUpdatePress}>Cancel</Button>
                                }
                                <Button onClick={ updateMode ? updatePost : handleNewPost}>{updateMode ? "Update" : "Post" }</Button>
                            </DialogActions>
                        </Box>
                    </Box>
                </Dialog>
            }

            {/* Filter Options Dialog */}
            {
                <Menu open={popup == 'filter'} anchorEl={filterMenuAnchor}
                    onClose={() => {setFilterMenuAnchor(null); setPopup('')}} disableScrollLock>
                    <FormGroup sx={{minWidth:320, padding:2, gap:2}}>
                        <FormControlLabel label='Suggestion'control={<Checkbox checked={filterArray[0]}
                            onClick={() => setFilterArray([!filterArray[0], filterArray[1], filterArray[2]])} />}/>
                        <FormControlLabel label='Problem' control={<Checkbox checked={filterArray[1]}
                            onClick={() => setFilterArray([filterArray[0], !filterArray[1], filterArray[2]])}/>}/>
                        <FormControlLabel label='General' control={<Checkbox checked={filterArray[2]}
                            onClick={() => setFilterArray([filterArray[0], filterArray[1], !filterArray[2]])}/>}/>
                    </FormGroup>
                </Menu>
            }
            {/* Opened Post Dialog */}
            {
                currPostIndex >= 0 &&
                data.length != 0 &&
                <Dialog open={popup == 'post'} maxWidth='lg' fullWidth>
                    {
                        deleteAlert &&
                        <Alert variant="filled" severity="error">
                            <Box sx={{display:'flex', flexDirection:'row'}}>
                                <Typography sx={{width:'80%'}}>
                                    Confirm deletion? Once done, data cannot be recovered.
                                </Typography>
                                <Box sx={{display:'flex', flexDirection:'row', gap:1}}>
                                    <Button className="p-0" onClick={() => handleConfirmDelete(currPostIndex)}>
                                        Accept
                                    </Button>
                                    <Button className="p-0" onClick={() => setDeleteAlert(false)}>
                                        Cancel
                                    </Button>
                                </Box>
                            </Box>
                        </Alert>
                    }
                    <Box sx={{ backgroundColor: postColours[currPostIndex] }} className='text-white'>
                        <Box sx={{display: 'flex', justifyContent:'flex-end' }}>
                            {
                                data[currPostIndex].username == user &&
                                <Button onClick={() => handleUpdatePress()}>
                                    <EditNote/>
                                </Button>
                            }
                            {
                                data[currPostIndex].username == user &&
                                <Button onClick={() => setDeleteAlert(true)}>
                                    <DeleteOutline/>
                                </Button>
                            }
                            <Button onClick={() => { setPopup(''); setCurrPostIndex(0); setCommentText(''); setCommentError(false) ; setCommentData([]) }}
                                sx={{justifySelf:'end'}}>
                                <Close/>
                            </Button>
                        </Box>
                        <Box className='p-2'>
                            <Typography className="font-bold" variant="h3" sx={{justifySelf:'center'}}>{data[currPostIndex].title}</Typography>
                            <Typography
                                className="mb-5" variant="body1"
                                sx={{justifySelf:'center'}}>by: {data[currPostIndex].username} on {new Date(data[currPostIndex].time).toLocaleString()}
                            </Typography>
                            <Stack direction='row' spacing={1}>
                                <Chip color="info" className="font-bold" label={data[currPostIndex].category}></Chip>
                                {
                                    String(data[currPostIndex].keywords).split(",").map((y, id) => (
                                        <Chip sx={{backgroundColor:'whitesmoke'}} className="font-bold" key={id} label={y}></Chip>
                                    ))
                                }
                            </Stack>
                        </Box>
                    </Box>
                    <Box sx={{padding:2}}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', wordWrap: 'break-word' }}>{data[currPostIndex].description}</Typography>
                    </Box>
                    <Box sx={{padding:1, backgroundColor:'whitesmoke'}}>
                        <Typography variant="body2"></Typography>
                    </Box>
                    <Box sx={{padding:2}}>
                        <Typography className="font-bold mt-1" variant="h6">Comments</Typography>
                        {
                            commentData.length == 0
                            ? (
                                <Typography variant="body2" className="italic">No one has posted a comment yet. Be the first!</Typography>
                            )
                            : (
                                <Stack spacing={1}>
                                    {
                                        commentData.map((x, index) => (
                                            <Box key={index} className='border-2 rounded-xl p-2'>
                                                <Box sx={{display:'flex', flexDirection:'row', gap:1}}>
                                                    <Avatar>{x.commenter.charAt(0)}</Avatar>
                                                    <Box sx={{width:'100%'}}>
                                                        <Box sx={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                                                            <Typography className="font-bold mt-2">{x.commenter}</Typography>
                                                            {
                                                                x.commenter == user &&
                                                                <Box>
                                                                    <Button onClick={() => {
                                                                        setCommentTarget(index); setCommentText(x.comment);
                                                                        setCommentError(false); setUpdateCommentMode(true)
                                                                        }}>
                                                                        <EditNote/>
                                                                    </Button>
                                                                    <Button onClick={e => {
                                                                        setCommentTarget(index); setDelMenuAnchor(e.currentTarget);
                                                                        setDelCommentPopup(true)
                                                                        }}>
                                                                        <DeleteOutline/>
                                                                    </Button>
                                                                </Box>                                                    
                                                            }
                                                        </Box>
                                                        <Typography>{x.comment}</Typography>
                                                        <Typography variant='body2' className="italic mt-2">{new Date(x.timing).toLocaleString()}</Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        ))
                                    }
                                </Stack>
                            )
                        }
                        <TextField fullWidth variant="outlined" value={commentText} onChange={e => setCommentText(e.target.value)}
                            error={commentError} helperText={commentError ? "Please enter a valid comment" : ""}
                            placeholder="Type your comment here." size="small" multiline className="mt-3"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AddComment/>
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button color="inherit" size="large" onClick={() => handleNewComment(currPostIndex)}>
                                                <Send/>
                                            </Button>
                                        </InputAdornment>
                                    )
                                }
                            }}/>
                    </Box>
                </Dialog>
            }

            {/* Loading */}
            {
                <Backdrop open={loading}>
                    <CircularProgress/>
                </Backdrop>
            }

            {/* Error Dedicated Popup */}
            {
                <Dialog open={errorPopup} maxWidth='sm' fullWidth>
                    <Alert severity="error" action={<Button onClick={() => { setErrorPopup(false); setErrorMessage('') }}><Close/></Button>}>
                        <Typography>{errorMessage}</Typography>
                    </Alert>
                </Dialog>
            }

            {/* Delete Comment Menu Popup */}
            {
                <Menu open={delCommentPopup} anchorEl={delMenuAnchor} sx={{'& .MuiMenu-paper': { backgroundColor:'red'}}}
                    onClose={() => { setCommentTarget(0); setDelCommentPopup(false); setDelMenuAnchor(null) }} disableScrollLock>
                    <Typography className="p-2 text-white font-bold">Confirm deletion? Once done, data cannot be recovered.</Typography>
                    <Button onClick={() => { deleteComment(commentTarget); setDelCommentPopup(false); setDelMenuAnchor(null); setCommentTarget(0) }}>Confirm</Button>
                    <Button onClick={() => { setCommentTarget(0); setDelCommentPopup(false); setDelMenuAnchor(null) }}>Cancel</Button>
                </Menu>
            }
            {/* Update Comment Popup */}
            {
                <Dialog open={updateCommentMode} maxWidth='sm' fullWidth>
                    <Typography variant="h5" className="p-2">Update comment</Typography>
                    <TextField fullWidth variant="outlined" value={commentText} onChange={e => setCommentText(e.target.value)}
                            error={commentError} helperText={commentError ? "Please enter a valid comment" : ""}
                            placeholder="Type your comment here." size="small" multiline className="mt-3 p-2"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AddComment/>
                                        </InputAdornment>
                                    )
                                }
                            }}/>
                    <DialogActions>
                        <Button onClick={ () => { setUpdateCommentMode(false); setCommentTarget(0); setCommentError(false); setCommentText('') }}>Cancel</Button>
                        <Button onClick={ () => { updateComment(commentTarget); setUpdateCommentMode(false); setCommentError(false); setCommentText('') }}>Update</Button>
                    </DialogActions>
                </Dialog>
            }
        </Box>
    )
}