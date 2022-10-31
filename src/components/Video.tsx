import "./Video.css";

interface IVideoProps {
  source: string;
  title: string;
}

function Video({ source, title }: IVideoProps): JSX.Element {
  const sourceVideo = require(`../downloads/${source}`);
  return (
    <div className="Video">
      <p>{title}</p>
      <video width="300px" controls>
        <source src={sourceVideo}></source>
      </video>
    </div>
  );
}

export default Video;
