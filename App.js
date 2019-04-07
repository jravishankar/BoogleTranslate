import React from 'react';
import { Button, View, Text, Picker, StyleSheet } from 'react-native';
import { FileSystem, Permissions, Audio } from 'expo';

//import { AudioRecorder, AudioUtils } from 'react-native-audio';

//let audioPath = AudioUtils.DocumentDirectoryPath + '/test.aac';

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      inlang: "en",
      outlang: "es",
      speech: "es-US",
      isRecording: false,
      isPlaying: false,
      isBuffering: false,
      recording: new Audio.Recording(),
      sound: null,
    }
  }

  componentDidMount() {
    Permissions.askAsync(Permissions.AUDIO_RECORDING);
    Audio.setIsEnabledAsync(true);
    //Audio.setAudioModeAsync({
    //  shouldDuckAndroid: true,
    //  interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
    //});
  }

  async _record(){
    if(!this.state.isRecording){
      const recording = this.state.recording;
      console.log(recording);
      try {
        console.log("about to prepare recording");
        await recording.prepareToRecordAsync({
          android: {
            extension: '.wav',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_AAC_ADTS,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        });
        await recording.setOnRecordingStatusUpdate((s)=>console.log(s));
        console.log(recording);
        await recording.startAsync()
          .then(()=>{
            this.setState({isRecording: true});
            console.log("recording");
          })
          .catch(error=>{
            console.log(error)
            this._cancelRecording.bind(this);
          });
      } catch  (error) {
          console.log(error);
      }
    }
  }

  async _cancelRecording(){
    const recording = this.state.recording;
    recording.stopAndUnloadAsync()
    .then(()=>{
      this.setState({
        isRecording: false, 
        recording: (new Audio.Recording()),
      }); 
    });
    
  }

  async _stopRecording(){
    const recording = this.state.recording;
    recording.stopAndUnloadAsync()
    .then(()=>{
      console.log(recording.getURI());
      recording.createNewLoadedSoundAsync()
      .then(async (info) => {
        console.log(info.sound);
        console.log("Sound Status", info.status);
        info.sound.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);

        this.setState({sound: info.sound});

      })
      .catch(e=>console.log(e));

      this.setState({
        isRecording: false, 
        recording: (new Audio.Recording()),
      });
    });
    
  }
  
  _sendSound(sound){
    sound.getStatusAsync()
    .then((status) => {
      var filename = status.uri.split('/');
      filename = filename[filename.length - 1];
      const soundFile = {
        uri: FileSystem.cacheDirectory+"Audio/"+filename,
        name: filename,
        type: 'audio/wav',
      };

      const body = new FormData();
      body.append('name', 'Zale');
      body.append('speechInput', soundFile);

      console.log(body);
      console.log(FileSystem.cacheDirectory);
      console.log(Audio);
      fetch('https://trans-lang.herokuapp.com/api/v2/translate', {
      //fetch('http://140.233.183.235:3000/api/v2/translate', {
        method: 'POST',
        body: body,
      })
      .then(async (data)=>{
        console.log(data);

        const translation = new Audio.Sound();
        await translation.loadAsync({uri: 'https://trans-lang.herokuapp.com/output.mp3'}, {shouldPlay: true}, true);
      })
      .catch(e=>console.log(e));

    })
    .catch(e=>console.log(e));
  }
  async _playSound(){
      try{
        await this.state.sound.playAsync()
        .then(this.setState({isPlaying: true}))
        .catch(e=>console.log(e));
      }
      catch(err){
        console.log(err)
      }
  }

  async _stopSound(){
      try{
        await this.state.sound.stopAsync()
        .then(this.setState({isPlaying: false}))
        .catch(e=>console.log(e));
      }
      catch(err){
        console.log(err)
      }
  }

  _onPlaybackStatusUpdate = playbackStatus => {
    if (!playbackStatus.isLoaded) {
      if (playbackStatus.error) {
        console.log(`Encountered a fatal error during playback: ${playbackStatus.error}`);
      }
    } else {
      this.setState({
        isPlaying: playbackStatus.isPlaying,
        isBuffering: playbackStatus.isBuffering,
      });
    }
  };


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

        {this.state.isRecording && (<Text>Recording...</Text>)}
        <Button disabled={this.state.isRecording} title= "Record" onPress= {this._record.bind(this)}>
        </Button>

        <Button disabled={!this.state.isRecording} title= "Stop Recording" onPress= {this._stopRecording.bind(this)}>
        </Button>

        <Button disabled={!this.state.sound || this.state.isPlaying} title= "Play" onPress= {this._playSound.bind(this)}>
        </Button>

        <Button disabled={!this.state.sound || !this.state.isPlaying} title= "Stop Playing" onPress= {this._stopSound.bind(this)}>
        </Button>

        <Button disabled={!this.state.sound} title= "Send Sound" onPress= {()=>this._sendSound(this.state.sound)}>
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
