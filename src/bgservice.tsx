//import { Linking } from 'react-native';
import TrackPlayer, { Event } from 'react-native-track-player';

export default async function trackPlayerService() {
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    await TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    await TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    await TrackPlayer.stop();
  });

  //TrackPlayer.addEventListener(Event.RemoteDuck, async () => {
  //  await Linking.openURL('audiostreamer://index');
 // });
}

