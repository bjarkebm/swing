import Sister from 'sister';
import rebound from 'rebound';
import Card from './card';
import util from './util';

let Stack;

/**
 * @param {Object} config Stack configuration.
 * @return {Object} An instance of Stack object.
 */
Stack = (config) => {
    let construct,
        eventEmitter,
        index,
        springSystem,
        stack;

    const eventNames = [
        'throwout',
        'throwoutend',
        'throwoutleft',
        'throwoutright',
        'throwin',
        'throwinend',
        'dragstart',
        'dragmove',
        'dragend'
    ];

    construct = () => {
        stack = {};
        springSystem = new rebound.SpringSystem();
        eventEmitter = Sister();
        index = [];
    };

    construct();

    /**
     * Get the configuration object.
     *
     * @return {Object}
     */
    stack.getConfig = () => config;

    /**
     * Get a singleton instance of the SpringSystem physics engine.
     *
     * @return {Sister}
     */
    stack.getSpringSystem = () => springSystem;

    /**
     * Proxy to the instance of the event emitter.
     *
     * @param {String} eventName
     * @param {String} listener
     * @return {undefined}
     */
    stack.on = (eventName, listener) => {
        eventEmitter.on(eventName, listener);
    };

    /**
     * Creates an instance of Card and associates it with an element.
     *
     * @param {HTMLElement} element
     * @return {Card}
     */
    stack.createCard = (element) => {
        let card,
            listeners;

        listeners = [];
        card = Card(stack, element);

        // Proxy Card events to the Stack.
        eventNames.forEach((eventName) => {
            listeners.push(card.on(eventName, (data) => {
                eventEmitter.trigger(eventName, data);
            }));
        });

        index.push({
            element,
            card,
            listeners
        });

        return card;
    };

    /**
     * Returns an instance of Card associated with an element.
     *
     * @param {HTMLElement} element
     * @return {Card|null}
     */
    stack.getCard = (element) => {
        let card;

        card = util.find(index, {
            element
        });

        if (card) {
            return card.card;
        }

        return null;
    };

    /**
     * Remove an instance of Card from the stack index.
     *
     * @param {Card} card
     * @return {Card}
     */
    stack.destroyCard = (card) => {
        let removedCard,
            removedCards;

        removedCards = util.remove(index, {
            card
        });

        if (!removedCards || !removedCards.length) {
            return null;
        }

        removedCard = removedCards[0];

        removedCard.listeners.forEach((listener) => {
            removedCard.card.off(listener);
        });

        return removedCard.card;
    };

    return stack;
};

export default Stack;
