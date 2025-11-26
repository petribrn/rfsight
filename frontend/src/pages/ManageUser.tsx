import { Breadcrumbs, Grid, Paper, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { BreadcrumbLink, ManageUserForm } from "../shared/components";
import { useGetUserInfoQuery } from "../shared/store/slices/user/userApiSlice";
import { UserInfo } from "../shared/ts/types";


export const ManageUserPage = () => {
  const { username } = useParams();
  const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo>();
  const {data: userInfo, isLoading: userInfoLoading} = useGetUserInfoQuery(username!);

  useEffect(() => {
    if (!userInfoLoading) {
      setCurrentUserInfo(userInfo);
    }
  }, [userInfo, userInfoLoading])

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
        {currentUserInfo ? (
              <ManageUserForm user={currentUserInfo} />
          ):(
            <Skeleton />
        )}
      </Paper>
    </Grid>
  </Grid>
}
