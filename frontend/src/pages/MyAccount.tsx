import { Breadcrumbs, Grid, Paper, Typography } from "@mui/material";
import { useState } from "react";
import { useParams } from 'react-router-dom';
import { BreadcrumbLink } from "../shared/components";


export const MyAccountPage = () => {
  const { username } = useParams();
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  return <Grid container gap={3} justifyContent="center" flexDirection="column">
    <Grid>
      <Breadcrumbs aria-label="breadcrumb">
        <BreadcrumbLink to="/dashboard">Home</BreadcrumbLink>
        <BreadcrumbLink to="/users">Usuários</BreadcrumbLink>
        <Typography color="text.primary">{username}</Typography>
      </Breadcrumbs>
    </Grid>
    <Grid>
      <Paper sx={{ p: 3 }}>
        <Typography>User {username} info</Typography>
      </Paper>
    </Grid>
  </Grid>
}
