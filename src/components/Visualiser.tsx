import { Box } from '@chakra-ui/react';
import { transform, useAnimationFrame } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FiPlay } from 'react-icons/fi';
import sound from '../assets/piano.mp3';

const Visualiser: React.FC = () => {
  const audioContext = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const analyserNode = useRef<AnalyserNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);

  const analyserData = useRef<Float32Array>();

  const [isPlaying, setIsPlaying] = useState(false);

  const initialize = () => {
    if (!audioRef.current) return;
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }
    // connect audio to web audio api
    const source = audioContext.current.createMediaElementSource(
      audioRef.current
    );

    // master gain node and analyser
    if (!gainNode.current) {
      gainNode.current = audioContext.current.createGain();
      analyserNode.current = audioContext.current.createAnalyser();

      // connect source to gain
      source.connect(gainNode.current);

      analyserData.current = new Float32Array(analyserNode.current.fftSize);

      // connect gain to analyser and speaker
      gainNode.current.gain.value = 3;
      gainNode.current.connect(analyserNode.current);
      gainNode.current.connect(audioContext.current.destination);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      if (!audioContext.current) initialize();
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  const [linePoints, setLinePoints] = useState(['0,50', '200,50']);

  useAnimationFrame((time, delta) => {
    if (!analyserNode.current || !analyserData.current) return;
    // assign time domain data to array
    analyserNode.current?.getFloatTimeDomainData(analyserData.current);
    // create new points
    if (!analyserData.current) return;
    const newPoints: string[] = [];
    analyserData.current.forEach((amplitude, i) => {
      if (!analyserData.current) return '0,0';
      const y = transform(amplitude, [-1, 1], [0, 100]);
      const x = transform(i, [0, analyserData.current.length], [0, 200]);
      newPoints.push(`${x},${y}`);
    });
    setLinePoints(newPoints);
  });

  return (
    <Box
      position="relative"
      display="flex"
      justifyContent="center"
      w="100vw"
      fontSize={128}
      onClick={() => setIsPlaying(!isPlaying)}
      cursor="pointer"
    >
      <audio
        src={sound}
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
      >
        {isPlaying ? null : <FiPlay />}
      </Box>
      <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <polyline points={linePoints.join(' ')} fill="none" stroke="#777" />
      </svg>
    </Box>
  );
};

export default Visualiser;
