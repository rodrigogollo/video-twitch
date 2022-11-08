import { useEffect, useState } from "react";
import "./Video.css";

interface IVideoProps {
  source: string;
  title: string;
}

function Video({ source, title }: IVideoProps): JSX.Element {
  const [video, setVideo] = useState(null);

  useEffect(() => {
    async function getVideoData() {
      const video = await require(`../downloads/${source}`);
      setVideo(video);
    }
    getVideoData();
  }, [video, source]);

  return (
    <div className="Video">
      {video && (
        <>
          <p>{title}</p>
          <video
            width="300px"
            controls
            onLoadStart={(videoObject) =>
              (videoObject.currentTarget.volume = 0.3)
            }
          >
            <source src={video} type="video/mp4"></source>
          </video>
        </>
      )}
    </div>
  );
}

export default Video;
