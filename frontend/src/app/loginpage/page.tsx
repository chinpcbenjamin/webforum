'use client'
import React, { ReactNode, useEffect } from 'react';
import { Container, Fab, Stack, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert } from '@mui/material';
import { PersonOutline, Login, AccountCircle, ArrowBack, ArrowForward } from '@mui/icons-material';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

interface LoginOptionTileProps {
    title : string,
    children? : ReactNode,
    onClick? : () => void,
    sx? : any,
    className? : string
}

const LoginOptionTile: React.FC<LoginOptionTileProps> = ({title, children, onClick, sx, className}) => {
    return (
        <Fab
            className={clsx('gap-2', className)}
            onClick={onClick}
            sx={{
                borderRadius: 4,
                height: 32,
                width: 360,
                ...sx
            }}>
            <Typography>{title}</Typography>
            {children}
        </Fab>
    )
}

export default function LoginPage() {
    const [window, setWindow] = React.useState<number>(0)
    // 0 is default window, 1 is create account, 2 is sign in

    const [username, setUsername] = React.useState<string>("")
    const [password, setPassword] = React.useState<string>("")
    const [cfmPW, setCfmPW] = React.useState<string>("")

    const [message, setMessage] = React.useState<string>("")
    const [messageAlert, setMessageAlert] = React.useState<boolean>(false)
    const [messageType, setMessageType] = React.useState<number>(0)

    const router = useRouter()
    
    const handle_create_new_account_press : () => void = () => {
        setWindow(1)
    }

    useEffect(() => {
        const verify_user : () => void = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify`, {
                    method: "POST",
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({
                        "token": localStorage.getItem("token")
                    })
                })
    
                if (!response.ok) {
                    return
                } else {
                    router.push("../forumpage")
                }
            } catch (error) {
                setMessageAlert(true)
                setMessageType(0)
                setMessage('Unknown Error detected.')
            }
        }
        verify_user()
    }, [])

    const attempt_new_user_account_creation: () => void = async () => {
        if (password != cfmPW) {
            return
        } else {
            // send request to backend
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/new-user`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                })
                if (response.ok) {
                    setMessageType(1)
                    setMessageAlert(true)
                    setMessage("Account created successfully. Please wait while we sign you in.")
                    // after logging in, attempt sign in
                    attempt_user_sign_in()                    
                } else {
                    setMessageType(0)
                    setMessageAlert(true)
                    if (response.status == 500) {
                        setMessage("Internal Server Error. Please try again.")
                    } else if (response.status == 400) {
                        setMessage("Error. Failed to receive username and password.")
                    } else if (response.status == 409) {
                        setMessage("Username already exists.")
                    } else {
                        setMessage("Error. Please try again.")
                    }
                }
            } catch (error : any) {
                setMessageType(0)
                setMessageAlert(true)
                setMessage(error)
            }
        }
    }

    const attempt_user_sign_in : () => void = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sign-in`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })

            if (response.ok) {
                const a = await response.json()
                localStorage.setItem("token", a.token)
                setMessageType(1)
                setMessageAlert(true)
                setMessage("Sign-in successful. Please wait.")
                router.push('../forumpage/')
            } else {
                setMessageType(0)
                setMessageAlert(true)
                if (response.status == 500) {
                    setMessage("Internal Server Error. Please try again.")
                } else if (response.status == 400) {
                    setMessage("Error. Invalid Username or Password")
                } else if (response.status == 401) {
                    setMessage("Error. Username not found or Password did not match.")
                }else {
                    setMessage("Error. Please try again.")
                }
            }
        } catch (error: any) {
            setMessageType(0)
            setMessageAlert(true)
            setMessage(error)
        }
    }

    const return_to_window_0: () => void = () => {
        setUsername('')
        setPassword('')
        setCfmPW('')
        setWindow(0)
    }

    const handle_forward_button: () => void = () => {
        if (window == 1) {
            attempt_new_user_account_creation()
        } else if (window == 2) {
            attempt_user_sign_in()
        }
    }

    return (
        <Container className='h-screen flex flex-col items-center justify-center'>
            {
                messageAlert && 
                <Alert severity={messageType == 0 ? "error" : "success"} onClose={() => {setMessage(""); setMessageAlert(false)}}>{message}</Alert>
            }
            <Box
                className='flex flex-col items-center justify-center gap-7'
                sx={{
                    border: 0,
                    borderRadius: 4,
                    width: 600,
                    height: 400,
                    boxShadow: 3
                }}>
                {
                    window == 0 &&
                    <Container className='flex items-center justify-center gap-2'>
                        <Typography
                            variant='h4'>Let's Get Started!</Typography>
                        <Login/>
                    </Container>
                }
                <Stack spacing={4}>
                    {
                        window == 0 &&
                        <LoginOptionTile
                            title='Create new account'
                            className='bg-blue-400 text-white'
                            onClick={handle_create_new_account_press}>
                        </LoginOptionTile>
                        
                    }
                    {
                        window == 0 &&
                        <LoginOptionTile
                            title='I already have an account'
                            onClick={() => setWindow(2)}
                            className='bg-gray-400 text-white'>
                        </LoginOptionTile>
                    }
                    {
                        window == 1 &&
                        <Box className='flex justify-center gap-2'>
                            <Typography variant='h5'>New User Account Registration</Typography>
                            <AccountCircle fontSize='large'/>
                        </Box>
                    }
                    {
                        window == 2 && 
                        <Box className='flex justify-center gap-2'>
                            <Typography variant='h4'>Existing User Sign-In</Typography>
                            <Login fontSize='large'/>
                        </Box>
                    }                    
                    {
                        (window == 1 || window == 2) &&
                        <TextField
                            variant='outlined'
                            required
                            placeholder='Username'
                            value={username}
                            onChange={x => setUsername(x.target.value)}>
                        </TextField>
                    }
                    {
                        (window == 1 || window == 2) &&
                        <TextField
                            variant='outlined'
                            required
                            type='password'
                            placeholder='Password'
                            value={password}
                            onChange={x => setPassword(x.target.value)}>
                        </TextField>
                    }
                    {
                        window == 1 &&
                        <TextField
                            variant='outlined'
                            required
                            type='password'
                            placeholder='Re-enter Password'
                            value={cfmPW}
                            onChange={x => setCfmPW(x.target.value)}
                            error={cfmPW != password}
                            helperText={cfmPW != password ? "The passwords do not match." : ""}>
                        </TextField>
                    }
                </Stack>
                {
                    (window == 1 || window == 2) &&
                    <Stack direction='row' sx={{width: 400}} gap={34}>
                        <Button
                            onClick={return_to_window_0}>
                            <ArrowBack/>
                        </Button>
                        <Button
                            onClick={handle_forward_button}>
                            <ArrowForward/>
                        </Button>
                    </Stack>
                }
            </Box>
        </Container>
    )
}