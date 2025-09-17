import React from "react";
import { ScrollView } from "react-native";
import NMEngineer from "../components/NMEngineer";

export default function NMEngineerDisplay() {
  return (
    <ScrollView>
      <NMEngineer
        name="Om Arya"
        year="Junior"
        position="Tech Lead"
        linkedin="https://www.linkedin.com/in/om-arya"
        github="https://github.com/om-arya"
        email="om.arya0577@gmail.com"
        profilePictureURL={require("../assets/images/om-arya.jpg")}
      />
    </ScrollView>
  );
}
