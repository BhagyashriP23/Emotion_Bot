/* eslint-disable no-mixed-operators */
/*
  Copyright (c) 2019 Dabble Lab

  Template 3 - Alexa Audio Streaming Example Skill

  For a tutorial on using this template please visit:
  https://dabblelab.com/templates/3-alexa-audio-streaming-example-skill

*/

const Alexa = require('ask-sdk-core');
var Spotify = require('node-spotify-api');

var song_url ;


const STREAMS = [
  {
    token: '1',
    url: 'https://streaming.radionomy.com/-ibizaglobalradio-?lang=en-US&appName=iTunes.m3u',
    metadata: {
      title: 'Stream One',
      subtitle: 'A subtitle for stream one',
      art: {
        sources: [
          {
            contentDescription: 'example image',
            url: 'https://s3.amazonaws.com/cdn.dabblelab.com/img/audiostream-starter-512x512.png',
            widthPixels: 512,
            heightPixels: 512,
          },
        ],
      },
      backgroundImage: {
        sources: [
          {
            contentDescription: 'example image',
            url: 'https://s3.amazonaws.com/cdn.dabblelab.com/img/wayfarer-on-beach-1200x800.png',
            widthPixels: 1200,
            heightPixels: 800,
          },
        ],
      },
    },
  },
];

const PlayStreamIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (
          handlerInput.requestEnvelope.request.intent.name === 'PlayStreamIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOnIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NextIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PreviousIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ShuffleOnIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StartOverIntent'
        );
  },
 async handle(handlerInput) {

    var slotVal = Alexa.getSlotValue(handlerInput.requestEnvelope, 'song');
    console.log(slotVal);
    
   var spotify = new Spotify({
    id: '473300ba72a041a0ab9e900b5b7b8ceb',
    secret: 'a7fce3ff6d5a49a7b9dcba3adfe034a2'
   });

    await   spotify.search({ type: 'track', query: slotVal })
      .then(function(response) {
        song_url =  response.tracks.items[0].preview_url;
        console.log(song_url);
      })
      
      .catch(function(err) {
        console.log(err);
      });
      
    const stream = STREAMS[0];
    var speakOutput = 'Playing song, ' + slotVal;

    handlerInput.responseBuilder
      .speak(`${speakOutput}`)
      .addAudioPlayerPlayDirective('REPLACE_ALL', song_url, stream.token, 0, null, stream.metadata);
      
      song_url = "";
    return handlerInput.responseBuilder
      .withSimpleCard(
      "EmoBot",
      "playing")
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'This skill plays an audio stream when it is started.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const AboutIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AboutIntent';
  },
  handle(handlerInput) {
    const speechText = 'This is an audio streaming skill, to play a song say, ask emotion bot to play song name.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOffIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ShuffleOffIntent'
        );
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStoppedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'PlaybackController.PauseCommandIssued'
            || handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStopped';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStartedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStarted';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ENQUEUED');

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const ExceptionEncounteredRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return true;
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(handlerInput.requestEnvelope.request.type);
    return handlerInput.responseBuilder
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    PlayStreamIntentHandler,
    PlaybackStartedIntentHandler,
    CancelAndStopIntentHandler,
    PlaybackStoppedIntentHandler,
    AboutIntentHandler,
    HelpIntentHandler,
    ExceptionEncounteredRequestHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
