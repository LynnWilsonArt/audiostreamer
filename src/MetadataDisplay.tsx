import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';

const MetadataDisplay = ({ selectedStream }) => {
  const [trackTitle, setTrackTitle] = useState({
    artist: 'Loading...',
    song: '',
    genre: '',
    website: '',
  });

  const parseTitle = (rawTitle) => {
    const parts = rawTitle.split(' - ').map(p => p.trim()).filter(Boolean);
    return {
      artist: parts[0] || 'Unknown Artist',
      song: parts[1] || 'Unknown Title',
      genre: parts[2] || 'Unknown Genre',
      website: parts[3] || 'Unknown Source',
    };
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('https://stream.southeastern-radio.org/status-json.xsl');
        const data = await response.json();

        const sources = Array.isArray(data.icestats.source)
          ? data.icestats.source
          : [data.icestats.source];

        const matched = sources.find((s) => s.server_url === selectedStream);
        const title = matched?.title || '';
        const parsed = parseTitle(title);
        setTrackTitle(parsed);
      } catch (error) {
        console.log('Metadata fetch error:', error);
        setTrackTitle({
          artist: 'Live Stream',
          song: '',
          genre: '',
          website: '',
        });
      }
    };

    fetchMetadata();
    const interval = setInterval(fetchMetadata, 15000);
    return () => clearInterval(interval);
  }, [selectedStream]);

  return (
    <View style={styles.metadataContainer}>
      <Text style={styles.metadataText}>🎤 Artist: {trackTitle.artist}</Text>
      <Text style={styles.metadataText}>🎵 Song: {trackTitle.song}</Text>
      <Text style={styles.metadataText}>🎧 Genre: {trackTitle.genre}</Text>
      <Text style={styles.metadataText}>🌐 Source: {trackTitle.website}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  metadataContainer: {
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  metadataText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default MetadataDisplay;
