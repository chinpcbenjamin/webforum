'use client'

import React, { useEffect, useState } from "react"
import { Typography, Container, Button, TextField, InputAdornment, Drawer, Box, List, ListItemButton, ListItemIcon,
    ListItemText, ListSubheader, Dialog, DialogTitle, FormControl, RadioGroup, Radio, FormControlLabel,
    Stack,
    Chip,
    DialogActions,
    Alert,
    AlertTitle} from "@mui/material"
import { AccountCircle, AddBox, Close, Description, Forum, Logout, Search, Settings, Title, Tune, WebStories } from "@mui/icons-material"
import { useRouter } from "next/navigation"

export default function forum() {
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
    const router = useRouter()
    const [user, setUser] = useState<string>('')

    const [popup, setPopup] = useState<string>('')

    const [title, setTitle] = useState<string>('')
    const [category, setCategory] = useState<string>('Suggestion')
    const [description, setDescription] = useState<string>('')
    const [keywords, setKeywords] = useState<string[]>([])
    const [keywordsText, setKeywordsText] = useState<string>('')
    const [newPostError, setNewPostError] = useState<boolean>(false)

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
                console.error(error)
            }
        }
        verify_user()
    }, [])

    const handleNewPost : () => void = async () => {
        if (title == '' || description == '' || keywords.length == 0) {
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
                        'title': title,
                        'username' : user,
                        'category' : category,
                        'keywords' : keywords.reduce((a, b) => a.concat(',').concat(b)),
                        'description' : description
                    })
                })

                if (response.ok) {
                    console.log("yay")
                } else {
                    console.log("ay")
                }
            } catch (error) {
                console.error(error)
            }
        }
    }

    const drawerList = (
        <Box sx={{width: 200}} className='flex flex-col'>
            <Box className='flex flex-row m-3'>
                <AccountCircle sx={{width: 36, height: 36}}/>
                <Typography sx={{paddingLeft:2, paddingTop: 1}}>{user}</Typography>
            </Box>
            <List
                subheader={
                    <ListSubheader>
                        Settings
                    </ListSubheader>
                }
                sx={{marginTop:4}}>

                <ListItemButton className="mx-2 mb-2">
                    <ListItemIcon>
                        <WebStories sx={{width: 36, height: 36}}/>
                    </ListItemIcon>
                    <ListItemText>
                        View Your Posts
                    </ListItemText>
                </ListItemButton>

                <ListItemButton className="m-2" onClick={() => router.push("/")}>
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
                    placeholder="Search for a topic"
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search/>
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Button color="inherit" size="large">
                                        <Tune/>
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
            
            <Container className="flex items-center justify-center">
                <Typography>test</Typography>
            </Container>

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
                        <Button onClick={() => setPopup('')} sx={{justifySelf:'end'}}>
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
        </Box>
    )
}