import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Button,
  Divider,
  Searchbar,
  TextInput,
  Provider as PaperProvider,
} from 'react-native-paper';
// import { Dropdown } from 'react-native-paper-dropdown';
// used react-native-element-dropdown instead
import { Dropdown } from 'react-native-element-dropdown';

const SelectedScreen = () => {
  const time = '9:30';
  // const searchWord = 'Abreva cream';
  const langOptions = [
    { label: 'EN', value: 'EN' },
    { label: 'SP', value: 'SP' },
  ];
  const sortOptions = [
    { label: 'price', value: 'By price' },
    { label: 'distance', value: 'By distance' },
  ];
  const formOptions = [
    { label: 'tube', value: 'tube' },
    { label: 'form', value: 'form' },
  ];

  const [search, setSearch] = useState('');
  const [buttonBKG, setButtonBKG] = useState('white');
  const [lang, setLang] = useState('EN');

  const handleButton = () => {
    if (buttonBKG === 'white') {
      setButtonBKG('#B6EBFF'); // when button option is selected
    } else {
      setButtonBKG('white');
    }
  };

  return (
    <PaperProvider>
      <View style={{ backgroundColor: 'white', height: '100%', width: '100%', padding: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
          <Text style={styles.time}>{time}</Text>
          <Text style={styles.icons}>Icons</Text>
        </View>

        <View
          style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}
        >
          <Searchbar
            placeholder=""
            style={styles.search}
            inputStyle={{ color: '#41484D' }}
            value={search}
            onChangeText={setSearch}
          />
          <Dropdown
            placeholder="EN"
            labelField="label"
            valueField="value"
            data={langOptions}
            onChange={handleButton}
            style={{
              width: 60,
              borderColor: '#C1C7CE',
              borderWidth: 1,
              padding: 5,
              paddingLeft: 10,
              borderRadius: 10,
            }}
            placeholderStyle={{ color: '#41484D' }}
            itemTextStyle={{ color: '#41484D' }}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <Dropdown
            placeholder="Form"
            value="Tube"
            data={formOptions}
            labelField="label"
            valueField="value"
            onChange={handleButton}
            style={{
              flex: 2,
              borderColor: '#C1C7CE',
              borderWidth: 1,
              padding: 5,
              paddingLeft: 10,
              borderRadius: 10,
            }}
            placeholderStyle={{ color: '#41484D' }}
            itemTextStyle={{ color: '#41484D' }}
            searchField="hello"
          />
          <TextInput style={styles.textInput} placeholder="How much?" textColor="#71787E" />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <TextInput
            style={styles.textInput}
            placeholder="Where?"
            textColor="#71787E"
            left={<TextInput.Icon icon="pin" />}
          />
          <TextInput style={styles.textInput} placeholder="Radius" textColor="#71787E" />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <Dropdown
            placeholder="By price"
            value="Tube"
            data={sortOptions}
            labelField="label"
            valueField="value"
            onChange={handleButton}
            style={{
              width: 100,
              borderColor: '#C1C7CE',
              borderWidth: 1,
              padding: 5,
              paddingLeft: 10,
              borderRadius: 10,
            }}
            placeholderStyle={{ color: '#41484D' }}
            itemTextStyle={{ color: '#41484D' }}
          />
          <Button
            mode="contained"
            style={styles.button}
            contentStyle={{ padding: 0, margin: 0 }}
            onPress={handleButton}
            buttonColor={buttonBKG}
          >
            Include generic (docosanal)
          </Button>
        </View>

        <View style={{ backgroundColor: '#F6FAFE', marginTop: 12, padding: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexDirection: 'column', flex: 2 }}>
              <Text>Pharmacy Name</Text>
              <Text>$Price</Text>
            </View>
            <Text style={{ alignSelf: 'center' }}>Distance</Text>
          </View>
          <Divider />
        </View>
      </View>
    </PaperProvider>
  );
};

export default SelectedScreen;

const styles = StyleSheet.create({
  time: {
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  icons: {
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  textInput: {
    margin: 5,
    borderWidth: 0.5,
    backgroundColor: 'white',
    width: '50%',
  },
  search: {
    margin: 10,
    width: '70%',
    alignSelf: 'flex-start',
    backgroundColor: '#E5E8ED',
  },
  button: {
    padding: 0,
    width: '70%',
    alignSelf: 'flex-end',
    // backgroundColor: 'white', // when selected #B6EBFF
    color: '#41484D', // when selected #004E60
    borderRadius: 10,
    borderColor: '#C1C7CE',
    borderWidth: 1,
  },
  drop: {
    alignSelf: 'center',
    backgroundColor: '#B6EBFF',
  },
});

// style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} for View component

// clearIcon for search
