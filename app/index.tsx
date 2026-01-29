import React, { useState, useEffect } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, AppState, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import TrackPlayer, { Capability, State, Event, useTrackPlayerEvents } from 'react-native-track-player';
import trackPlayerService from '../src/bgservice';
import MetadataDisplay from '../src/MetadataDisplay';
import { Image as ExpoImage } from 'expo-image'; // Import ExpoImage

// ✅ Register background service
TrackPlayer.registerPlaybackService(() => trackPlayerService);

// 🎵 Stream list
const streamOptions = [
  { label: 'Mix Genre Stream', value: 'https://stream.southeastern-radio.org/radio-mix.mp3' },
  { label: 'Country Stream', value: 'https://stream.southeastern-radio.org/country.mp3' },
  { label: 'Blues Stream', value: 'https://stream.southeastern-radio.org/blues.mp3' },
  { label: 'Gospel Stream', value: 'https://stream.southeastern-radio.org/gospel.mp3' },
  { label: 'Classical/Easy Stream', value: 'https://stream.southeastern-radio.org/easy.mp3' },
];

const imageUrl = 'https://player.southeastern-radio.org/assets/appImage/appImage.gif'; // Define image URL

const IcecastPlayer = () => {
  const [selectedStream, setSelectedStream] = useState(streamOptions[0].value);
  const [playerState, setPlayerState] = useState<State>(State.None);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUri, setImageUri] = useState(imageUrl); // State for image URI

  // 🔧 Setup TrackPlayer and Preload Image
  useEffect(() => {
    const setup = async () => {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        stopWithApp: false,
        capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
        compactCapabilities: [Capability.Play, Capability.Pause],
        notificationCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
        android: {
          notificationClickOpensActivity: false, // prevents new activity
        },
      });

      // Preload image
      ExpoImage.prefetch(imageUrl); // Use ExpoImage.prefetch
      // Optionally, update the image URI with a cache-busting query parameter
      setImageUri(`${imageUrl}?${new Date().getTime()}`);
    };
    setup();

    return () => TrackPlayer.stop();
  }, []);

  // 🔄 Listen to playback state changes
  useTrackPlayerEvents([Event.PlaybackState], (event) => {
    if (event.state) {
      setPlayerState(event.state);
      setIsLoading(event.state === State.Buffering || event.state === State.Connecting);
    }
  });

  // ⬆ Stop background playback when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        await TrackPlayer.stop();
        setPlayerState(State.None);
        setIsLoading(false);
      }
    });
    return () => sub.remove();
  }, []);

  // ▶️ Play selected stream
  const playStream = async (url: string) => {
    setIsLoading(true);
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: 'stream',
      url,
      title: 'Live Radio',
      artist: 'Southeastern Radio',
      artwork: require('../assets/logo.png'),
    });
    await TrackPlayer.play();
  };

  // ⏹ Stop playback
  const stopStream = async () => {
    await TrackPlayer.stop();
    setPlayerState(State.None);
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Stream Information</Text>
      <MetadataDisplay selectedStream={selectedStream} />

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedStream}
          onValueChange={(itemValue) => {
            setSelectedStream(itemValue);
            playStream(itemValue);
          }}
          style={styles.picker}
        >
          {streamOptions.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
              style={{ fontSize: 20, fontWeight: 'bold' }}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        disabled={isLoading}
        onPress={playerState === State.Playing ? stopStream : () => playStream(selectedStream)}
        style={[styles.button, isLoading && { opacity: 0.6 }]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {playerState === State.Playing ? 'Stop ⏹️' : 'Play ▶️'}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.copy}>App Version 2.0.9</Text>

      <View style={styles.imageWrapper}>
        {/* Use ExpoImage for caching and placeholder */}
        <ExpoImage
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="contain" 
          placeholder={require('../assets/logo.png')} // Optional: Add a placeholder
          transition={2000} // Optional: Add a transition effect
        />
      </View>

      <View>
        <Text style={styles.copy}>
          Copyright (c) 2026 by Lynn Wilson{'\n'}
          All media is the intellectual property of the individual artist.
        </Text>
      </View>
    </View>
  );
};

// 🎨 Styles (unchanged)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#c7a500', padding: 20, alignItems: 'center' },
  logo: { position: 'absolute', top: 20, left: 20, width: 100, height: 100, resizeMode: 'contain' },
  title: { fontSize: 25, fontWeight: 'bold', marginTop: 110, marginBottom: 10, color: '#895803' },
  copy: { fontSize: 12, color: '#555', textAlign: 'center', marginTop: 5 },
  picker: { width: '100%', backgroundColor: '#d2b48c' },
  pickerWrapper: { width: '100%', marginBottom: 20, borderWidth: 2, borderColor: '#ffffff', borderRadius: 8, backgroundColor: '#d2b48c', overflow: 'hidden' },
  button: { backgroundColor: '#4a90e2', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25 },
  buttonText: { color: '#fff', fontSize: 16 },
  imageWrapper: { marginBottom: 2, marginTop: 5, borderWidth: 2, borderColor: '#ffffff', borderRadius: 8, overflow: 'hidden' },
  image: { width: 300, height: 300},
});

export default IcecastPlayer;
