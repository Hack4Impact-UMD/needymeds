import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

interface NMEngineerProps {
  name: string;
  year: string;
  position: string;
  linkedin: string;
  github: string;
  email: string;
  profilePictureURL: any; // use require("path/to/image") for local images
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
          <Icon name="linkedin-square" size={28} color="#0077b5" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL(github)}>
          <Icon name="github" size={28} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${email}`)}>
          <Icon name="envelope" size={28} color="#d44638" />
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
    justifyContent: "center",
    gap: 20,
  },
});

export default NMEngineer;