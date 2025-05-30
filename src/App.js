import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import Login from "./paginas/Login/Login";
import Registro from "./paginas/Registro/Registro";
import HomeVideo from "./paginas/HomeVideo/HomeVideo.jsx";

import ProtectedRoute from "./componentes/ProtectedRoutes";
import ChatRoom from "./componentes/chatRoom/ChatRoom.jsx";
import ChatList from "./paginas/ChatList/ChatList.jsx";
import UserProfile from "./paginas/UserProfile/UserProfile";
import VideoDetail from "./paginas/VideoDetail/VideoDetail.jsx";
import UploadVideo from "./paginas/UploadVideo/UploadVideo.jsx";
import EditVideo from "./paginas/EditVideo/EditVideo.jsx";
import TeacherList from "./paginas/teacherList/TeacherList.jsx";
import TeacherDetail from "./paginas/TeacherDetail/TeacherDetail.jsx";
import EditUserProfile from "./paginas/EditUserProfile/EditUserProfile.jsx";
import Calendario from "./paginas/Calendario/Calendario.jsx";
import CallPage from "./componentes/callPage/callPage.jsx";



function App() {
  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <Routes>
        {/* para rutas publicas */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

       

        {/* para rutas protegidas */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeVideo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editUser/:id"
          element={
            <ProtectedRoute>
              <EditUserProfile />
            </ProtectedRoute>
          }
        />


      <Route
        path="/video/:id"
        element={
          <ProtectedRoute>
            <VideoDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/createVideo"
        element={
          <ProtectedRoute>
            <UploadVideo />
          </ProtectedRoute>
        }
      />
      
      <Route 
        path="/edit/:id"
        element={
          <ProtectedRoute>
            <EditVideo />
          </ProtectedRoute>
          } 
        />

        <Route 
        path="/teachers" 
        element={
          <ProtectedRoute>
            <TeacherList />
          </ProtectedRoute> 
        } 
        />

        <Route 
        path="/teacher/:id" 
        element={
          <ProtectedRoute>
            <TeacherDetail />
          </ProtectedRoute>
        }
         />

        <Route
          path="/chatRoom/:numRoom"
          element={
            <ProtectedRoute>
              <ChatRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatList" 
          element={
            <ProtectedRoute>
              <ChatList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route 
        path="/calendar" 
        element={
          <ProtectedRoute>
            <Calendario />
          </ProtectedRoute> 
        } 
        />

        <Route 
        path="/call/:id" 
        element={
          <ProtectedRoute>
            <CallPage />
          </ProtectedRoute> 
        } 
        />

        
      </Routes>
    </Router>
  );
}

export default App;
