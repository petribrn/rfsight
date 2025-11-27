import { Box, Breadcrumbs, Grid, Paper, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "react-toastify";
import { BreadcrumbLink, ManageUserForm } from "../shared/components";
import { useAppSelector } from "../shared/hooks";
import { useGetUserInfoQuery } from "../shared/store/slices/user/userApiSlice";
import { selectUserInfo } from "../shared/store/slices/user/userSlice";
import { Permissions } from "../shared/ts/enums";
import { UserInfo } from "../shared/ts/types";


export const ManageUserPage = () => {
  const { username } = useParams();
  const loggedUserInfo = useAppSelector(selectUserInfo);
  const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo>();
  const {data: userInfo, isLoading: userInfoLoading} = useGetUserInfoQuery(username!);

  const navigate = useNavigate();

  useEffect(() => {
    if (loggedUserInfo) {
      if (loggedUserInfo.username !== username &&
        ![Permissions.Admin, Permissions.GuestAdmin, Permissions.Master].includes(loggedUserInfo.permission)){
        toast.error('Permissões insuficientes!');
        navigate('/dashboard');
      }
    }
  }, [loggedUserInfo])

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
            <Box height={'30vh'} display={'flex'}>
              <Skeleton height={'100%'}/>
            </Box>
        )}
      </Paper>
    </Grid>
  </Grid>
}
