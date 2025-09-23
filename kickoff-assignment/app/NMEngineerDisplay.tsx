import React from "react";
import { ScrollView } from "react-native";
import { Stack } from "expo-router";

import NMEngineer from "../components/NMEngineer";

export default function NMEngineerDisplay() {
  return (
    <>
      <Stack.Screen
        options={{ title: "🏆 NeedyMeds Engineer Display 🏆" }}
      />
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
        <NMEngineer
          name="Samarth Kolanupaka"
          year="Freshman"
          position="Engineer"
          linkedin="https://www.linkedin.com/in/samarth-kolanupaka-0b2019259/"
          github="https://github.com/samarth212"
          email="samarth212@gmail.com"
          profilePictureURL={require("../assets/images/samarth-kolanupaka.jpg")}
        />

        <NMEngineer
          name="Bhavya Tanugula"
          year="Sophomore"
          position="Engineer"
          linkedin="https://www.linkedin.com/in/bhavya-tanugula-3650b3306/"
          github="https://github.com/bhavyat-01"
          email="bhavya.tanugula@gmail.com"
          profilePictureURL={require("../assets/images/bhavya-tanugula.jpg")}
        />

        <NMEngineer
          name="Angela Ngo"
          year="Sophomore"
          position="Engineer"
          linkedin="https://www.linkedin.com/in/ngo-angela/"
          github="https://github.com/ango06"
          email="ngoangela6@gmail.com"
          profilePictureURL={require("../assets/images/angela-ngo.jpg")}
        />
        
      </ScrollView>
    </>
  );
}
