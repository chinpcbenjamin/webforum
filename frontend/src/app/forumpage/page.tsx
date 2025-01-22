'use client'

import React, { useState } from "react"
import { Typography, Container, Button, TextField, InputAdornment, Drawer, Box, List, Dialog, DialogTitle, FormControl, RadioGroup, Radio, FormControlLabel,
    Stack, Chip, DialogActions, Alert, AlertTitle, ListItem, Paper, Menu, Checkbox, FormGroup, Avatar } from "@mui/material"
import { AddBox, AddComment, Close, Description, Forum, Search, Send, Settings, Title, Tune } from "@mui/icons-material"
import ForumDataHook from "./hooks/forumDataHook"

export default function forum() {
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

    const { user, data, postColours, retrieveForumData, drawerList, currPostIndex, setCurrPostIndex,
        commentText, setCommentText, commentData, setCommentData, commentError, setCommentError, handleNewComment,
        getCurrPostComments } = ForumDataHook()

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
                const response = await fetch("http://localhost:3001/new-post", {
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
                } else {
                    setNewPostError(true)
                }
            } catch (error) {
                console.error(error)
            }
        }
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
            <Box className='flex flex-row'>
                <TextField
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
                                    <Button color='inherit'>
                                        <Search/>
                                    </Button>
                                </InputAdornment>
                            )
                        }
                    }}>
                </TextField>
                <Button onClick={() => setPopup('newPost')}>
                    <AddBox sx={{width: 36, height: 36, color:'#93c5fd'}}/>
                </Button>
            </Box>
            
            {/* List of Forum Content */}
            {
                <Box className="flex flex-row justify-center" sx={{minWidth:"100%"}}>
                    <List sx={{minWidth:"40%"}}>
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
                                    </Paper>
                                </ListItem>
                            )
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

            {/* Add a new post to the forum popup */}
            {
                <Dialog open={popup == 'newPost'} maxWidth='lg' fullWidth>
                    <Box sx={{display: 'flex', justifyContent:'flex-end'}}>
                        <Button color='inherit' onClick={() => setPopup('')} sx={{justifySelf:'end'}}>
                            <Close/>
                        </Button>
                    </Box>
                    <Box className='p-5'>
                        <Box sx={{display: 'flex', justifyContent:'center'}}>
                            <DialogTitle className="font-bold">New Discussion</DialogTitle>
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
                                <Button onClick={handleNewPost}>Post</Button>
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
                        <FormControlLabel label='Suggestion'control={<Checkbox onClick={() => setFilterArray([!filterArray[0], filterArray[1], filterArray[2]])} />}/>
                        <FormControlLabel label='Problem' control={<Checkbox onClick={() => setFilterArray([filterArray[0], !filterArray[1], filterArray[2]])}/>}/>
                        <FormControlLabel label='General' control={<Checkbox onClick={() => setFilterArray([filterArray[0], filterArray[1], !filterArray[2]])}/>}/>
                    </FormGroup>
                </Menu>
            }
            {/* Opened Post Dialog */}
            {
                currPostIndex >= 0 &&
                data.length != 0 &&
                <Dialog open={popup == 'post'} maxWidth='lg' fullWidth>
                    <Box sx={{ backgroundColor: postColours[currPostIndex] }} className='text-white'>
                        <Box sx={{display: 'flex', justifyContent:'flex-end' }}>
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
                        <Typography variant="body1">{data[currPostIndex].description}</Typography>
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
                                                    <Box>
                                                        <Typography className="font-bold mt-2">{x.commenter}</Typography>
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
        </Box>
    )
}