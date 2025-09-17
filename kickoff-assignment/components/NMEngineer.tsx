import React from "react";
import { View, Text, Image, StyleSheet, Linking, TouchableOpacity } from "react-native";

interface NMEngineerProps {
  name: string;
  year: string;
  position: string;
  linkedin: string;
  github: string;
  email: string;
  profilePictureURL: any; // use require("path/to/image") when passing local images
}

const NMEngineer: React.FC<NMEngineerProps> = ({
  name,
  year,
  position,
  linkedin,
  github,
  email,
  profilePictureURL,
}) => {
  return (
    <View style={styles.card}>
      <Image source={profilePictureURL} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.position}>{position}</Text>
      <Text style={styles.year}>{year}</Text>

      <View style={styles.links}>
        <TouchableOpacity onPress={() => Linking.openURL(linkedin)}>
          <Text style={styles.link}>LinkedIn</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(github)}>
          <Text style={styles.link}>GitHub</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${email}`)}>
          <Text style={styles.link}>Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  position: {
    fontSize: 16,
    color: "#555",
  },
  year: {
    fontSize: 14,
    color: "#777",
    marginBottom: 12,
  },
  links: {
    flexDirection: "row",
    gap: 12,
  },
  link: {
    fontSize: 14,
    color: "#0077b5",
    marginHorizontal: 8,
    textDecorationLine: "underline",
  },
});

export default NMEngineer;