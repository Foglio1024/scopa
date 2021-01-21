const path = require('path');

/* customDefs structure
{
    OPCODE_NAME : {
        protocolVersion : opcodeNumber
    }
}
*/
var customDefs = {
    "S_TRADE_BROKER_WAITING_ITEM_LIST": {
        "378037": 64812,
        "378447" : 64812
    },
    "TTB_S_PLAYER_CARD_DATA": {
        "378037": 20604,
        "378447" : 20604
    }
}
var defAvailable = false;

var fullCards = [];

class CardsFilter
{
    constructor(mod)
    {

        mod.dispatch.addDefinition('S_TRADE_BROKER_WAITING_ITEM_LIST', 99, path.join(mod.rootFolder, 'S_TRADE_BROKER_WAITING_ITEM_LIST.99.def'));        
        mod.dispatch.addDefinition('TTB_S_PLAYER_CARD_DATA', 99, path.join(mod.rootFolder, 'TTB_S_PLAYER_CARD_DATA.99.def'));      

        if (customDefs["S_TRADE_BROKER_WAITING_ITEM_LIST"][mod.dispatch.protocolVersion] !== undefined)
        {
            mod.dispatch.addOpcode("S_TRADE_BROKER_WAITING_ITEM_LIST", customDefs["S_TRADE_BROKER_WAITING_ITEM_LIST"][mod.dispatch.protocolVersion]);
            defAvailable = true;
        }
        if (customDefs["TTB_S_PLAYER_CARD_DATA"][mod.dispatch.protocolVersion] !== undefined)
        {
            mod.dispatch.addOpcode("TTB_S_PLAYER_CARD_DATA", customDefs["TTB_S_PLAYER_CARD_DATA"][mod.dispatch.protocolVersion]);
            defAvailable = defAvailable && true;
        }

        if (!defAvailable)
        {
            mod.command.message("<font color='#ff5555'>Missing opcode for current protocol.</font>");
            return;
        }

        mod.command.add('scopa', (cmd) =>
        {
            mod.settings.enabled = !mod.settings.enabled;
            mod.command.message('Cards filter ' + (mod.settings.enabled ? 'enabled' : 'disabled'));
        });

        mod.hook('S_TRADE_BROKER_WAITING_ITEM_LIST', 99, ev =>
        {
            if (!mod.settings.enabled) return;

            const newArray = [];
            ev.listings.forEach(item =>
            {
                if (!fullCards.includes(item.item))
                {
                    newArray.push(item);
                    // mod.log("Including item " + item.item);
                }
                else
                {
                    // mod.log("Excluding item " + item.item);
                }
            });
            mod.command.message("Filtered out " + (ev.listings.length - newArray.length) + " listings.");
            ev.listings = newArray;
            return true;
        });

        mod.hook("TTB_S_PLAYER_CARD_DATA", 99, ev =>
        {
            if (!mod.game.me.is(ev.gameId)) return;
            fullCards.splice(0, fullCards.length);
            let idx = 1;
            ev.cards.forEach(card =>
            {
                if (card.ownedAmount == 20)
                {
                    //mod.command.message("[" + (idx++) + "] Added card " + card.id + " to completed cards list.")
                    fullCards.push(card.id);
                }
            });
        });
    }
}

module.exports = CardsFilter;
