import React from 'react';
import { Button, View, Text, Picker, StyleSheet } from 'react-native';
import {Audio} from 'expo';
import Permissions from 'react-native-permissions'

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      inlang: "en",
      outlang: "es",
      speech: "es-US"

    }
  }

  componentDidMount() {
    Permissions.askAsync(Permissions.AUDIO_RECORDING);
  }


  render() {
    const { inlang, outlang, speech } = this.state;

    return (
      <View>
        <Text> Input Language </Text>
        <Picker selectedValue={inlang} onValueChange={(lang) => {this.setState({inlang:lang})}}>
          <Picker.Item label = "English" value = "en" />
          <Picker.Item label = "Spanish" value = "es" />
          <Picker.Item label = "Japanese" value = "ja" />
          <Picker.Item label = "Russian" value = "ru" />
          <Picker.Item label = "German" value = "de" />
        </Picker>

        <Text> Output Language </Text>
        <Picker selectedValue={outlang} onValueChange={(lang) => {this.setState({outlang:lang})}}>
          <Picker.Item label = "English" value = "en" />
          <Picker.Item label = "Spanish" value = "es" />
          <Picker.Item label = "Japanese" value = "ja" />
          <Picker.Item label = "Russian" value = "ru" />
          <Picker.Item label = "German" value = "de" />
        </Picker>

        <Button title= "audio" onPress= {async () => {
            const recording = new Audio.Recording();
            try {
              await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
              await recording.startAsync();
            } catch  (error) {

            }
            }}>
          </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'solid',
    borderColor: 'black'
  }
});
