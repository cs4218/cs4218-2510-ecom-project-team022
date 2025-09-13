import React, { useState, useEffect } from "react";
import Layout from '../../components/Layout';
import AdminMenu from '../../components/AdminMenu';
import axios from "axios";
import toast from "react-hot-toast";

//added functionality of viewing user
const Users = () => {
  const [users, setUsers] = useState([]);

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get("/api/v1/auth/all-users");
      setUsers(data.users); 
    } catch (error) {
      console.log(error);
      toast.error("View User: Something Went Wrong");
    }
  };

//lifecycle method
  useEffect(() => {
    getAllUsers();
  }, []);

  const determineRole = (role) => (role === 0? "User":"Admin");

  return (
    <Layout title={"Dashboard - All Users"}>
        <div className="container-fluid m-3 p-3">
       <div className="row">
          <div className="col-md-3">
            <AdminMenu />
           </div>
           <div className="col-md-9">
             <h1>All Users</h1>
             <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Role</th>
              </tr>
            </thead>
       <tbody>
        {users.map((user)=> (
          <tr key={user._id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.phone}</td>
            <td>{user.address}</td>
            <td>{determineRole(user.role)}</td>
          </tr>
        ))}
       </tbody> 
      </table>
     </div>
    </div>
    </div>
   </Layout>
  );
};

export default Users;