import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';

import NMEngineer from '../components/NMEngineer';

export default function NMEngineerDisplay() {
  return (
    <>
      <Stack.Screen options={{ title: '🏆 NeedyMeds Engineer Display 🏆' }} />
      <ScrollView>
        <NMEngineer
          name="Om Arya"
          year="Junior"
          position="Tech Lead"
          linkedin="https://www.linkedin.com/in/om-arya"
          github="https://github.com/om-arya"
          email="om.arya0577@gmail.com"
          profilePictureURL={require('../assets/images/om-arya.jpg')}
        />
        <NMEngineer
          name="Samarth Kolanupaka"
          year="Freshman"
          position="Engineer"
          linkedin="https://www.linkedin.com/in/samarth-kolanupaka-0b2019259/"
          github="https://github.com/samarth212"
          email="samarth212@gmail.com"
          profilePictureURL={require('../assets/images/samarth-kolanupaka.jpg')}
        />

        <NMEngineer
          name="Bhavya Tanugula"
          year="Sophomore"
          position="Engineer"
          linkedin="https://www.linkedin.com/in/bhavya-tanugula-3650b3306/"
          github="https://github.com/bhavyat-01"
          email="bhavya.tanugula@gmail.com"
          profilePictureURL={require('../assets/images/bhavya-tanugula.jpg')}
        />

        <NMEngineer
          name="Ayaan Hussain"
          year="Senior"
          position="Engineer"
          linkedin="https://www.linkedin.com/in/ayaan-z-hussain/"
          github="https://github.com/ayaanh-03"
          email="ayaanzh13@gmail.com"
          profilePictureURL={require('../assets/images/ayaan-hussain.jpg')}
        />

        <NMEngineer
          name="Angela Ngo"
          year="Sophomore"
          position="Engineer"
          linkedin="https://www.linkedin.com/in/ngo-angela/"
          github="https://github.com/ango06"
          email="ngoangela6@gmail.com"
          profilePictureURL={require('../assets/images/angela-ngo.jpg')}
        />

        <NMEngineer
          name="Parsa Sedghi"
          year="Senior"
          position="Engineer"
          linkedin="https://linkedin.com/in/parsa-sedghi"
          github="https://github.com/psedghi"
          email="psedghi@umd.edu"
          profilePictureURL={require('../assets/images/parsa-sedghi.jpg')}
        />

        <NMEngineer
          name="Dhanya Desai"
          year="Junior"
          position="Engineer"
          linkedin="https://www.linkedin.com/in/dhanyadesai/"
          github="https://github.com/dhanyades"
          email="dhanya.desai@gmail.com"
          profilePictureURL={require('../assets/images/dhanya-desai.jpg')}
        />

        <NMEngineer
          name="Eileen Chen"
          year="Masters"
          position="Engineer"
          linkedin="https://www.linkedin.com/in/eileendchen/"
          github="https://github.com/eileendchen"
          email="eileendchen@gmail.com"
          profilePictureURL={require('../assets/images/eileen-chen.jpg')}
        />
      </ScrollView>
    </>
  );
}
