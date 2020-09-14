log("info", "Loading...");
let firstStart = true;

if (String.prototype) {
  String.prototype.format =
    String.prototype.format ||
    function () {
      "use strict";
      var str = this.toString();
      if (arguments.length) {
        var t = typeof arguments[0];
        var key;
        var args =
          "string" === t || "number" === t
            ? Array.prototype.slice.call(arguments)
            : arguments[0];

        for (key in args) {
          str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
      }

      return str;
    };
  String.prototype.isEmpty =
    String.prototype.isEmpty ||
    function () {
      return this.length === 0 || !this.trim();
    };
}

function log(severity, message) {
  var args = Array.prototype.slice.call(arguments, log.length);
  message = "[testPlugin] " + message;
  switch (severity) {
    case "error":
      console.error(message, args);
      return;
    case "warn":
      console.warn(message, args);
      return;
    case "debug":
      console.debug(message, args);
      return;
    case "trace":
      console.trace(message, args);
      return;
    default:
      console.log(message, args);
      return;
  }
}

function getEvents() {
  let events = localStorage.getItem("events");
  if (events === null) {
    return JSON.parse("{}");
  }
  return JSON.parse(events);
}
function setEvents(events) {
  localStorage.setItem("events", JSON.stringify(events));
}
function addEvent(event) {
  let name = getEventName(event);
  let events = getEvents();
  events[name] = event;
  setEvents(events);
  log(
    "warn",
    "Added event " + name + " to JSON.parse(localStorage.getItem('events'))"
  );
}
function hasEvent(name) {
  return getEvents().hasOwnProperty(name);
}

function getEventName(event) {
  if (typeof event === "string") return event;
  return Object.keys(event)[0];
}

export function handleEvent(connection, ev) {
  if ("Events" in ev) {
    for (event of ev.Events) {
      // try { ev.Events[event].name = event; } catch (e) {}
      // let name = Object.keys(ev.Events[event])[0];
      // if (!isNaN(name)) { name = event; }
      onIncomingEvent(connection, getEventName(event), event);
    }
  }
  if (firstStart) {
    firstStart = false;
    log("warn", "Connection", connection);
  }
}

/*
con.sendMessage({
	Change: {
		ClientUpdate: {
			input_muted: false
		}
	}
})
*/

function onIncomingEvent(con, name, data) {
  /*try { data.name = nameof(() => data); } catch (e) {
		data.name = Object.keys({event});
	}*/
  log("debug", "Event:", name);
  if (name === "ChannelListFinished") {
    OnChannelListFinished();
  }
  if (data instanceof Object && Object.keys(data).length > 0) {
    console.log(data);
    // data.name = name;
    if ("Message" in data) {
      if ("target" in data.Message && "Poke" in data.Message.target) {
        OnPokeEvent(data.Message.invoker, data.Message.message);
      }
    }
  }
  if (name != null && isNaN(name) && !hasEvent(name)) addEvent(data);
}

function OnChannelListFinished() {
  name = con.book.getServer().name;
  log("warn", `Connected to \"${name}\". Setting TTS volume to 0`);
  con.transientSettings.synth.volume = 0;
}

function OnPokeEvent(invoker, message) {
  let msg = `You got poked by \"${invoker.name}\"`;
  if (!message.isEmpty()) {
    msg += `:\n\n${message}`;
  }
  setTimeout(function () {
    alert(msg);
  }, 1);
  // alert();
}

/*function DumpEvent(event) {
	let json = JSON.stringify(event);
	console.log("Sending:", json)
	postJson('http://localhost', json).then(data => {
	  console.log("Sent:", json);
	});
	alreadyDumpedEvents.push(event.name)
}

async function postJson(url = '', data = {}) {
	const response = await fetch(url, {
	  method: 'POST',
	  mode: 'no-cors', // no-cors, *cors, same-origin
	  cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
	  credentials: 'same-origin', // include, *same-origin, omit
	  headers: {
		'Content-Type': 'application/json'
	  },
	  redirect: 'follow',
	  referrerPolicy: 'no-referrer',
	  body: data
	});
	return response.json();
  }
*/
log("info", "Loaded!");
