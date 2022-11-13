import React, {useEffect,useState} from 'react'
import TollIcon from '@mui/icons-material/Toll';
import InsertCommentIcon from '@mui/icons-material/InsertComment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import db from '../firebase'
import "./Sidebar.css";
import UserProfile from './UserProfile';
import { ConstructionOutlined } from '@mui/icons-material';
import BlockIcon from '@mui/icons-material/Block';
function Sidebar({currentUser,signOut}) {
    const [allUsers,setAllUsers]=useState([]);
    const [searchInput,setSearchInput]=useState("");
    const [friendList, setFriendList] = useState([]);
    
    useEffect(() => {
        const getAllUsers= async () => {
            const data = await db.collection("users").onSnapshot(snapshot => {
                setAllUsers(snapshot.docs.filter((doc)=>doc.data().email !== currentUser?.email))
            })
        }
        
    const getFriends = async () => {
        const data = await db.collection("FriendList").doc(currentUser.email).collection("list").onSnapshot((snapshot) => {
            setFriendList(snapshot.docs )
        })
    }
    getAllUsers();
    getFriends();
    }, [])

    const searchedUser =allUsers.filter((user)=>{
        if (searchInput){
            if(user.data().fullname.toLowerCase().includes(searchInput.toLowerCase())||user.data().email.includes(searchInput)){
                return user
            }
        }

    });
    const searchItem = searchedUser.map((user)=>{
        return(
            <UserProfile 
            name={user.data().fullname} 
            photoURL={user.data().photoURL}
            key={user.id}
            email={user.data().email}
            />
        )
    });

    //en


    const deleteAccount=async(User)=>{
        const data = db.collection('users').doc(User);
        await data.delete();

      }
    const deleteFriendlist=async(User)=>{
        const data= db.collection('FriendList').doc(User).collection("list").doc("");
        await data.delete();
    }

  return (
    <div className="sidebar">
        <div className="sidebar-header">
            <div className="sidebar-header-img">
                <img src={currentUser?.photoURL} alt="User" onClick={()=>{openUserProfile()}}></img>
            </div>

        <div className="sidebar-header-btn">
            <BlockIcon onClick={()=>{alertDelteAccount()}}/>
            <ExitToAppIcon  onClick={()=>{alertSignOut()}}/>
        </div> 
        </div>
        <div className="sidebar-search">
            <div className="sidebar-search-input">
                <SearchIcon/>
                <input type="text" name="search"  placeholder="Search..." value={searchInput} onChange={(e)=>setSearchInput(e.target.value)}/>
            </div>
        </div>

        <div className="sidebar-chat-list">
            {
                searchItem.length > 0 ? searchItem : (
                    friendList.map((friend)=>(
                        <UserProfile 
                         name={friend.data().fullname}
                         photoURL={friend.data().photoURL} 
                         lastMessage={friend.data().lastMessage}
                         email={friend.data().email}
                         key={friend.id}
                         />
                    ))
                )
            }
        </div>
    </div>
  )

  function alertDelteAccount(){
    var mensaje;
    var opcion = window.confirm("¿Realmente deseas Borrar tu cuenta?");
    if (opcion == true) {
        mensaje = "Has borrado tu cuenta";
        deleteAccount(currentUser.email);
        deleteFriendlist(currentUser.email);
        //signOut();
	} else {
	    mensaje = "haz cancelado la eliminacion";
	}
    console.log(mensaje);
}

function alertSignOut(){
    var mensaje;
    var opcion = window.confirm("¿Realmente deseas Cerrar Sesion?");
    if (opcion == true) {
        mensaje = "Haz cerrado sesion";
        signOut();
	} else {
	    mensaje = "No haz cerradi sesion";
	}
    console.log(mensaje);
}
function openUserProfile() {
    window.open(
      "https://myaccount.google.com/personal-info", "_blank");
}


}


export default Sidebar