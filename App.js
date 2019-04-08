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
      isPlayingInput: false,
      isPlayingTranslation: false,
      isBufferingInput: false,
      isBufferingTranslation: false,
      recording: new Audio.Recording(),
      inputSound: null,
      translatedSound: null,
    }
  }

  componentDidMount() {
    Permissions.askAsync(Permissions.AUDIO_RECORDING);
    Audio.setIsEnabledAsync(true);
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: true
    })
    // Audio.setAudioModeAsync({
    //
    //
    // });
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
        }).catch((err) => {console.log(err)});
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
    else{
      this._stopRecording();
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
        info.sound.setStatusAsync({volume:1.0})
        console.log(info.sound);
        console.log("Sound Status", info.status);
        info.sound.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);

        this.setState({inputSound: info.sound});

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
      var directory = filename[filename.length - 2];
      filename = filename[filename.length - 1];
      const soundFile = {
        uri: FileSystem.cacheDirectory+directory+"/"+filename,
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
  async _playSound(sound){
    if(this.state.isPlayingInput){
      this._stopSound(sound);
    }
    else{
      try{
        await sound.playAsync()
        .then(this.setState({isPlayingInput: true}))
        .catch(e=>console.log(e));
      }
      catch(err){
        console.log(err)
      }
    }
  }

  async _stopSound(sound){
      try{
        await sound.stopAsync()
        .then(this.setState({isPlayingInput: false}))
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
        isPlayingInput: playbackStatus.isPlaying,
        isBuffering: playbackStatus.isBuffering,
      });
    }
  };


  render() {
    const { inlang, outlang, speech } = this.state;

    return (
        <View style={styles.container}>
          <View style={styles.inout}>
            <Text style={styles.input}> Input Language </Text>
            <Picker style={styles.picker} selectedValue={inlang} onValueChange={(lang) => {this.setState({inlang:lang})}}>
              <Picker.Item label = "English" value = "en" />
              <Picker.Item label = "Español  (Spanish)" value = "es" />
              <Picker.Item label = "日本語    (Japanese)" value = "ja" />
              <Picker.Item label = "Русский  (Russian)" value = "ru" />
              <Picker.Item label = "Deutsch (German)" value = "de" />
            </Picker>

            <Text style={styles.output}> Output Language </Text>
            <Picker selectedValue={outlang} onValueChange={(lang) => {this.setState({outlang:lang})}}>
              <Picker.Item label = "English" value = "en" />
              <Picker.Item label = "Español  (Spanish)" value = "es" />
              <Picker.Item label = "日本語    (Japanese)" value = "ja" />
              <Picker.Item label = "Русский  (Russian)" value = "ru" />
              <Picker.Item label = "Deutsch (German)" value = "de" />
            </Picker>
          </View>


          {this.state.isRecording && (<Text>Recording...</Text>)}
          <Button title={this.state.isRecording ? "Stop Recording" : "Record"} onPress= {this._record.bind(this)}>
          </Button>

          <Button disabled={this.state.inputSound === null} title={this.state.isPlayingInput ? "Stop Playing Input" : "Play Input"} onPress= {() => this._playSound.bind(this)(this.state.inputSound)}>
          </Button>

          <Button disabled={this.state.inputSound === null} title= "Send Sound" onPress= {()=>this._sendSound(this.state.inputSound)}>
          </Button>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },

  picker: {
    marginTop: -20,
  },
  input: {
    fontWeight: 'bold',
    fontSize: 26,
    textAlign: 'center',
    marginTop: 35,
  },
  output: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 26,
  },

  inout: {
    justifyContent: 'center',
  }
});
