'use client'

import React from "react"
import { Typography, Container, Button, TextField, InputAdornment, Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader} from "@mui/material"
import { Forum, Logout, Search, Settings, Tune, WebStories } from "@mui/icons-material"
import { useRouter } from "next/navigation"

export default function forum() {
    const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false)
    const router = useRouter()

    const drawerList = (
        <Box sx={{width: 200}} className='flex' >
            <List
                subheader={
                    <ListSubheader>
                        Settings
                    </ListSubheader>
                }>
                <ListItemButton className="m-2" onClick={() => router.push("/")}>
                    <ListItemIcon>
                        <Logout/>
                    </ListItemIcon>
                    <ListItemText>
                        Sign Out
                    </ListItemText>
                </ListItemButton>

                <ListItemButton className="m-2">
                    <ListItemIcon>
                        <WebStories/>
                    </ListItemIcon>
                    <ListItemText>
                        View Your Posts
                    </ListItemText>
                </ListItemButton>
            </List>
        </Box>
    )

    return (
        <Container>
            <Container className="flex flex-row justify-between items-center">
                <Forum sx={{width: 36, height: 36, color:"#979A9B"}}/>
                <Typography variant="h5">Benjamin's Forum</Typography>
                <Button onClick={() => setDrawerOpen(true)}>
                    <Settings sx={{width: 36, height: 36, color:"#979A9B"}}/>
                </Button>
            </Container>
            <TextField
                className="my-5"
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
            <Container className="h-screen flex items-center justify-center">
                <Typography>test</Typography>
            </Container>
            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                anchor="right">
                    {drawerList}    
            </Drawer>
        </Container>
    )
}