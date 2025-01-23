'use client'
import React from 'react';
import { Container, Fab, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation';


export default function Home() {
  const router = useRouter()

  function route_to_loginpage() {
    router.push('/loginpage/')
  }

  React.useEffect(() => {
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
                  router.push("/forumpage")
              }
          } catch (error) {
              alert('Unknown Error detected.')
          }
      }
      verify_user()
  }, [])

  return (
    <Container className='h-screen flex items-center justify-center'>
      <Typography variant='h1'>
        Welcome to Benjamin's Forum!
      </Typography>
      <Fab
        onClick={route_to_loginpage}
        sx={{
          color: '#E4E5E2',
          width: 64,
          height: 64,
          borderRadius: 4
        }}>
        <ArrowForwardIcon
          sx={{
            color: '#808080',
            width: 30,
            height: 30
          }}/>
      </Fab>
    </Container>
  )
}
