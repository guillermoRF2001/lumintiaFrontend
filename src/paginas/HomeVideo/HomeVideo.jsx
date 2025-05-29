import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../componentes/Header/Header";
import "./HomeVideo.css";
import { getVideos } from "../../api/videoApi";

function HomeVideo() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("title");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await getVideos();
        setVideos(data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const filteredVideos = videos.filter((video) => {
    const search = searchTerm.toLowerCase();
    if (searchField === "title") {
      return video.title.toLowerCase().includes(search);
    } else if (searchField === "user") {
      return video.user && video.user.name && video.user.name.toLowerCase().includes(search);
    }
    return true;
  });

  const rows = [];
  for (let i = 0; i < filteredVideos.length; i += 4) {
    rows.push(filteredVideos.slice(i, i + 4));
  }

  const handleVideoClick = (id) => {
    navigate(`/video/${id}`);
  };

  return (
    <div className="homeVideos-father">
      <Header/>

      
      <div className="homeVideos-body">
         <div className="search-bar-container">
            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder={`Buscar por título`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        <div className="homeVideos-header"></div>
        {isLoading ? (
          <p>Cargando videos...</p>
        ) : (
          <div className="image-grid">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="row">
                {row.map((video, index) => (
                  <div
                    key={index}
                    className="image-item"
                    onClick={() => handleVideoClick(video.id)}
                  >
                    <img
                      src={video.thumbnail_url || "/placeholder.jpg"}
                      alt={video.title || `Video ${index + 1}`}
                    />
                    <div className="video-info">
                      <p className="video-title">{video.title}</p>
                      {video.user && (
                        <div className="user-info">
                          <img
                            src={video.user.profile_picture || "/user-placeholder.jpg"}
                            alt={video.user.name}
                            className="user-image"
                          />
                          <span className="user-name">{video.user.name}</span>
                        </div>
                      )}
                      <p className="video-views">Visualizaciones: {video.views}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeVideo;
