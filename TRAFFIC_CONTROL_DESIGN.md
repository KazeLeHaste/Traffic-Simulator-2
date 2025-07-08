/**
 * # Modular Traffic Control System - UML Class Diagram
 * 
 * ```
 * +----------------------------+     +------------------------------+
 * | <<interface>>              |     | <<abstract>>                 |
 * | ITrafficControlStrategy    |     | AbstractTrafficControlStrategy|
 * +----------------------------+     +------------------------------+
 * | +strategyType: string      |     | +strategyType: string        |
 * | +displayName: string       |     | +displayName: string         |
 * | +description: string       |     | +description: string         |
 * |                            |     | #intersection: Intersection   |
 * | +initialize()              |     | #currentPhase: number        |
 * | +update()                  |     | #timeInPhase: number         |
 * | +reset()                   |     | #totalPhases: number         |
 * | +getCurrentPhase()         |     | #phaseDuration: number       |
 * | +getTotalPhases()          |     | #configOptions: Record       |
 * | +getConfigOptions()        |     |                              |
 * | +updateConfig()            |     | +initialize()                |
 * | +toJSON()                  |     | +update()                    |
 * | +fromJSON()                |     | +reset()                     |
 * +----------------------------+     | +getCurrentPhase()           |
 *          ▲                         | +getTotalPhases()            |
 *          |                         | +getConfigOptions()          |
 *          | implements              | +updateConfig()              |
 *          |                         | +toJSON()                    |
 *          |                         | +fromJSON()                  |
 *          |                         | #shouldSwitchPhase()         |
 *          |                         | #advanceToNextPhase()        |
 *          |                         | #getPhaseDuration()          |
 *          |                         | #abstract getCurrentSignalStates() |
 * +--------+---------------------+   +------------------------------+
 * |                              |             ▲
 * |                              |             | extends
 * |                              |             |
 * +------------------------------+  +---------+----------+  +----------------------+
 * | TrafficLightController       |  | FixedTimingStrategy|  |AdaptiveTimingStrategy|
 * +------------------------------+  +--------------------+  +----------------------+
 * | -intersection: Intersection  |  |+strategyType       |  |+strategyType         |
 * | -time: number                |  |+displayName        |  |+displayName          |
 * | -strategy: ITrafficControl   |  |+description        |  |+description          |
 * | -trafficStates: TrafficState |  |#states: string[][] |  |#states: string[][]   |
 * |                              |  |                    |  |-queueLengths: number[]|
 * | +constructor()               |  |+constructor()      |  |-waitTimes: number[]  |
 * | +static copy()               |  |+initialize()       |  |                      |
 * | +toJSON()                    |  |#getPhaseDuration() |  |+constructor()        |
 * | +setStrategy()               |  |#getCurrentSignal() |  |+initialize()         |
 * | +getStrategy()               |  |                    |  |#shouldSwitchPhase()  |
 * | +get state()                 |  +--------------------+  |#getPhaseDuration()   |
 * | -updateTrafficStates()       |          ▲              |#getCurrentSignal()    |
 * | +onTick()                    |          |              |                       |
 * +-----+-----------------------+           |              +----------------------+
 *       |                                   |                      ▲
 *       | uses                              | extends              |
 *       ▼                                   |                      | extends
 * +------------------------------+  +-------+------------+  +------+-------------+
 * | TrafficControlStrategyManager|  |AllRedFlashingStrategy|  | (Other Strategies..)|
 * +------------------------------+  +--------------------+  +----------------------+
 * | -strategies: Map             |  |+strategyType       |  |                      |
 * | -selectedStrategyType: string|  |+displayName        |  |                      |
 * |                              |  |+description        |  |                      |
 * | +registerStrategy()          |  |-signalsVisible     |  |                      |
 * | +getAvailableStrategyTypes() |  |-flashInterval      |  |                      |
 * | +selectStrategy()            |  |                    |  |                      |
 * | +getSelectedStrategyType()   |  |+update()           |  |                      |
 * | +createStrategy()            |  |#getCurrentSignal() |  |                      |
 * | +applyToIntersection()       |  |                    |  |                      |
 * | +createFromJSON()            |  +--------------------+  +----------------------+
 * +------------------------------+
 *
 * +---------------------------+
 * | IntersectionTrafficControl|
 * | Adapter                   |
 * +---------------------------+
 * | -intersection: Intersection|
 * | -controller: TrafficLight |
 * | +time                     |
 * | +stateNum                 |
 * | +flipInterval (getter)    |
 * | +state (getter)           |
 * |                           |
 * | +static create()          |
 * | +toJSON()                 |
 * | +flip()                   |
 * | +onTick()                 |
 * | +getController()          |
 * +---------------------------+
 * ```
 * 
 * ## Key Design Features:
 * 
 * 1. **Strategy Pattern**: The system uses the Strategy design pattern to encapsulate different traffic control algorithms.
 * 
 * 2. **Interface & Abstract Base Class**: Clear contracts through ITrafficControlStrategy interface and common implementation in AbstractTrafficControlStrategy.
 * 
 * 3. **Adapter Pattern**: IntersectionTrafficControlAdapter provides compatibility with the existing codebase.
 * 
 * 4. **Factory & Registry Pattern**: TrafficControlStrategyManager provides a centralized registry and factory for strategies.
 * 
 * 5. **Extensibility**: New strategies can be created by extending AbstractTrafficControlStrategy or implementing ITrafficControlStrategy.
 * 
 * 6. **Configuration**: Each strategy can define its own configuration options that can be adjusted at runtime.
 * 
 * 7. **Serialization**: Strategies can be serialized to JSON and restored, enabling saving and loading simulation states.
 * 
 * ## Example Control Strategies:
 * 
 * 1. **FixedTimingStrategy**: Traditional fixed-cycle signals with predetermined phase durations.
 * 
 * 2. **AdaptiveTimingStrategy**: Adjusts signal timings based on traffic conditions like queue lengths and wait times.
 * 
 * 3. **AllRedFlashingStrategy**: Emergency mode with all signals flashing red.
 * 
 * ## Potential Future Strategies:
 * 
 * 1. **ActuatedTimingStrategy**: Uses simulated vehicle detectors to extend green phases when vehicles are present.
 * 
 * 2. **CoordinatedTimingStrategy**: Synchronizes signals along a corridor to create "green waves".
 * 
 * 3. **OptimizedTimingStrategy**: Uses historical data to optimize signal timings for time of day.
 * 
 * 4. **AdaptiveCoordinationStrategy**: Dynamically adjusts coordination patterns based on traffic demand.
 * 
 * 5. **TrafficResponsiveStrategy**: Responds in real-time to changing traffic patterns and incidents.
 */
