
const tablePlayers = {}
const tableSeatIndexes = {}



async function parseGameState(message, site) {

  if (message.t === 'GoToTable') {
    console.log(message)
    const table_id = message?.info?.i

    console.log("go to table, table id? " + table_id)

    const hudContainer = `
          <div class="hud hud-main" id="hud_${table_id}">
            <div class="hud hud-header">
              <div class="hud hud-header-left" id="hud_header_left_${table_id}">
              <a class="minimize-hud" id="minMax_${table_id}">[-]</a>
              </div>
              <div class="hud hud-header-center" id="hud_header_center_${table_id}">
                <span class="hud hud-title">HUD - Table ${table_id}</span>
              </div>
              <div class="hud hud-header-right">
                <a class="close-hud" id="showHide_${table_id}"><</a>
              </div>
            </div>
            <div class="hud-container" id="hud_container_${table_id}">
              <div class="hud hud-preflop-advice" id="hud_advice_${table_id}">
                <span class="hud-preflop-advice"></span>
              </div>
              <div class="hud hud-muck-advice" id="hud_muck_${table_id}">
                <span class="hud-muck-advice"></span>
              </div>
              <div class="hud hud-stats" id="hud_stats_${table_id}">
              </div>

            </div>
            <div class="hud hud-footer" id="hud_stats_footer_${table_id}">
              <label for="showFolded" class="hud hud-footer-options-left">
                <input type="checkbox" id="showFolded_${table_id}"/>
                Show Folded
              </label>
              
                <div class="hud hud-footer-options-right" id="hud_opacity_${table_id}"/>
            </div>
          </div>`

    const gameDiv = $(`div[class*="${table_id}"]`)
    setTimeout(() => {
      console.log("game div:")
      console.log(gameDiv)
      $(hudContainer).attr('moved', false).css({
        position: "absolute",
        marginLeft: '1em', marginTop: 50,
        marginRight: '1em',
        top: 0, left: 0,
        backgroundColor: 'white',
        opacity: 0.7
      }).appendTo($(`div[class*="${table_id}"]`))

      $(`div#hud_header_center_${table_id}, div#hud_header_left_${table_id} `).click(() => {
        if ($(`div#hud_container_${table_id} `).is(':visible')) {
          $(`div#hud_container_${table_id} `).hide()
          $(`#hud_stats_footer_${table_id} `).hide()
          $(`a#minMax_${table_id} `).text('[+]')
        }
        else {
          $(`div#hud_container_${table_id} `).show()
          $(`#hud_stats_footer_${table_id} `).show()
          $(`a#minMax_${table_id} `).text('[-]')
        }
      })

      $(`a#showHide_${table_id} `).click(() => {
        if ($(`div#hud_header_center_${table_id} `).is(":visible")) {

          $(`div#hud_container_${table_id} `).hide()
          $(`a#minMax_${table_id} `).text('[+]')
          $(`div#hud_header_left_${table_id} `).hide()
          $(`div#hud_header_center_${table_id} `).hide()
          $(`#hud_stats_footer_${table_id} `).hide()
          $(`a#showHide_${table_id} `).text('>')
          $(`div#hud_${table_id} `).css({ 'width': '1em' })
        }
        else {
          $(`div#hud_header_left_${table_id} `).show()
          $(`div#hud_header_center_${table_id} `).show()
          $(`div#hud_container_${table_id} `).show()
          $(`#hud_stats_footer_${table_id} `).show()
          $(`a#showHide_${table_id} `).text('<')
          try {
            const tableWidth = $(`table#hud_stats_table_${table_id} `).width()
            $(`div#hud_${table_id} `).css({ 'width': tableWidth })
          }
          catch (err) {
            $(`div#hud_${table_id} `).css({ 'width': $(gameCanvas).width() * 0.25 })
          }

        }

      })

      $(`input#showFolded_${table_id}`).change(() => {
        console.log("showFolded change")
        if ($(`input#showFolded_${table_id}`).is(':checked')) {
          console.log('is checked')
          $(`table#hud_stats_table_${table_id}`).find('tr.folded').show()

          console.log("check folded rows")
          console.log($(`table#hud_stats_table_${table_id}`).find('tr.folded'))
        }
        else {
          console.log('is not checked')
          $(`table#hud_stats_table_${table_id}`).find('tr.folded').hide()
        }

      })
      $(`#hud_${table_id} `).draggable()
      $(`#hud_opacity_${table_id}`).slider({
        min: 20,
        max: 100,
        value: 75,
        change: (evt, ui) => {
          $(`div#hud_${table_id}`).css({ 'opacity': ui.value / 100 })
        }
      })

    }, 5000)
    console.log(gameDiv[0])



  }


  if (message.t === 'GameState') {
    console.log("game state message")
    const players = message?.gameState?.s.filter(val => val !== null).map(seat => seat?.n)
    const tableId = message?.gameState?.ti
    tablePlayers[tableId] = players


    
    console.log(tablePlayers)

    if(message?.events) {
      message?.events.forEach((evt) => {
        if(evt?.a === 1) {
          const foldedPlayer = tableSeatIndexes[tableId][evt?.n]
          console.log(`${foldedPlayer} folded`)
          $(`tr#tr_${tableId}_${foldedPlayer}`).addClass('folded')

          

        }
      })
    }

    if (!$(`input#showFolded_${tableId}`).is(':checked')) {
      $(`table#hud_stats_table_${tableId}`).find('tr.folded').hide()
    }
    else {
      $(`table#hud_stats_table_${tableId}`).find('tr.folded').show()
    }
    

  }

  if(message.t === 'TableState') {
    const seats = message?.seats
    const seatIdxToPlayers = {}

    seats.forEach((seat) => {
      seatIdxToPlayers[seat?.si] = seat?.pn
    })

    tableSeatIndexes[message?.tableId] = seatIdxToPlayers
    
    console.log(tableSeatIndexes)

  }



  if (message.t === 'Chat') {
    if (message?.chatMessage[0]?.m === 'New hand started') {

      const tableId = message?.tableId

      const playerNameString = tablePlayers[tableId].join(',')
      const apiEndpoint = `https://api.cornblaster.com/pokerdata/${site}/hud_stats/${playerNameString}`


      const divId = `#hud_stats_${tableId}`

      console.log("endpoint will be " + apiEndpoint)
      $.get(apiEndpoint, (response) => {
        console.log(response)
        $(divId).html(`<table class="hud hud-stats-table" id="hud_stats_table_${tableId}">
        <tr>
          <th>Player</th>
          <th>Hands</th>
          <th>VPIP</th>
          <th>PFR</th>
          <th>3BET</th>
          <th>WWSF</th>
          <th>WTSD</th>
          <th>WSD</th>
          <th>AG</th>
        </tr>
        <tbody>
        </tbody>
      </table>`
        )
        $(`table#hud_stats_table_${tableId}`).show()


        console.log(response)
        let i = 1

        response.hud_data.forEach((dataRow) => {
          const player = dataRow['player_name']
          let name = player
          if (name.length > 8) {
            name = player.substring(0, 7) + '..'
          }
          const hands = dataRow['total_hands']
          const vpip = Math.round(dataRow['VPIP'])
          const pfr = Math.round(dataRow['PFR'])
          const threeBet = Math.round(dataRow['3BET'])
          const wwsf = Math.round(dataRow['WWSF'])
          const wtsd = Math.round(dataRow['WTSD'])
          const wsd = Math.round(dataRow['WSD'])
          const ag = dataRow['AG']
          const trClass = 'player-row'
          let tdHandClass = 'player-hands'

          if (hands < 200) {
            tdHandClass += ' low-sample-size'
          }
          else if (hands >= 200 && hands < 1000) {
            tdHandClass += ' medium-sample-size'
          }
          else if (hands >= 1000) {
            tdHandClass += ' high-sample-size'
          }

          const htmlRow = `<tr class="${trClass}" id="tr_${tableId}_${player.replace(/(\W+)/g, '')}"><td>${name}</td><td class="${tdHandClass}">${hands}</td><td>${vpip}</td><td>${pfr}</td><td>${threeBet}</td><td>${wwsf}</td><td>${wtsd}</td><td>${wsd}</td><td>${ag}</td></tr>`
          $(`table#hud_stats_table_${tableId}`).append(htmlRow)
          i++
        })

      })




    }


  }





}


WebSocket.prototype = null; // extending WebSocket will throw an error if this is not set
const ORIGINAL_WEBSOCKET = WebSocket;
var WebSocket = window.WebSocket = class extends WebSocket {
  constructor(...args) {
    super(...args);

    this.addEventListener('message', event => {
      let ws_sniff_debug_from = new CustomEvent("ws_sniff_debug_from", {
        detail: {
          data: event,
          obj: this
        }
      });
      document.body.dispatchEvent(ws_sniff_debug_from);
      let site
      console.log("ORIGIN:")
      console.log(event.origin)
      if (event.origin === 'wss://web.stockpokeronline.com') {
        site = "stockpokeronline.com"
      }
      else if (event.origin === 'wss://fslat.poker-server.com') {
        site = "roundercasino.com"
      }
      parseGameState(JSON.parse(event.data), site)
    });

    this.addEventListener('open', event => {
      let ws_sniff_debug_open = new CustomEvent("ws_sniff_debug_open", {
        detail: {
          data: event,
          obj: this
        }
      });

    });


  }
  send(...args) {
    let ws_sniff_debug_to = new CustomEvent("ws_sniff_debug_to", {
      detail: {
        data: args[0],
        obj: this
      }
    });
    document.body.dispatchEvent(ws_sniff_debug_to);
    super.send(...args);
  }
}

const hudContainer = `
          <div class="hud hud-main" id="hud_${table_id}">
            <div class="hud hud-header">
              <div class="hud hud-header-left" id="hud_header_left_${table_id}">
              <a class="minimize-hud" id="minMax_${table_id}">[-]</a>
              </div>
              <div class="hud hud-header-center" id="hud_header_center_${table_id}">
                <span class="hud hud-title">HUD - Table ${table_id}</span>
              </div>
              <div class="hud hud-header-right">
                <a class="close-hud" id="showHide_${table_id}"><</a>
              </div>
            </div>
            <div class="hud-container" id="hud_container_${table_id}">
              <div class="hud hud-preflop-advice" id="hud_advice_${table_id}">
                <span class="hud-preflop-advice"></span>
              </div>
              <div class="hud hud-muck-advice" id="hud_muck_${table_id}">
                <span class="hud-muck-advice"></span>
              </div>
              <div class="hud hud-stats" id="hud_stats_${table_id}">
              </div>

            </div>
            <div class="hud hud-footer" id="hud_stats_footer_${table_id}">
              <label for="showFolded" class="hud hud-footer-options-left">
                <input type="checkbox" id="showFolded_${table_id}"/>
                Show Folded
              </label>
             
                <div class="hud hud-footer-options-right" id="hud_opacity_${table_id}"/>
            </div>
          </div>`

