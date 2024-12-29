'use client'
import React, { ReactNode } from 'react';
import { Container, Fab, Stack, Box, Typography, colors } from '@mui/material';
import { Google, Email, PersonOutline, Login } from '@mui/icons-material';
import clsx from 'clsx';

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
    return (
        <Container className='h-screen flex items-center justify-center'>
            <Box
                className='flex flex-col items-center justify-center gap-7'
                sx={{
                    border: 0,
                    borderRadius: 4,
                    width: 600,
                    height: 400,
                    boxShadow: 3
                }}>
                <Container className='flex items-center justify-center gap-2'>
                    <Typography
                        variant='h4'>Choose your Sign In Method</Typography>
                    <Login/>
                </Container>
                <Stack spacing={3}>
                    <LoginOptionTile
                        title='Sign In with Google'
                        className='bg-blue-400 hover:bg-blue-300 text-white'>
                        <Google/>
                    </LoginOptionTile>
                    <LoginOptionTile
                        title='Sign In with Email and Password'
                        className='bg-gray-400 hover:bg-gray-300 text-white'>
                        <Email/>
                    </LoginOptionTile>
                    <LoginOptionTile
                        title='Guest Sign-In'
                        className='bg-black hover:bg-gray-700 text-white'>
                        <PersonOutline/>
                    </LoginOptionTile>
                </Stack>
            </Box>
        </Container>
    )
}