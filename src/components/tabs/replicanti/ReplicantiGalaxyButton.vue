<script>
import PrimaryButton from "@/components/PrimaryButton";
import PrimaryToggleButton from "@/components/PrimaryToggleButton";
import { Autobuyer } from "../../../core/globals";

export default {
  name: "ReplicantiGalaxyButton",
  components: {
    PrimaryButton,
    PrimaryToggleButton
  },
  data() {
    return {
      isAvailable: false,
      isAutoUnlocked: false,
      isAutoActive: false,
      isAutoEnabled: false,
      isDivideUnlocked: false,
      isForceEnabled: false,
      boughtGalaxies: 0,
      extraGalaxies: 0
    };
  },
  computed: {
    resetActionDisplay() {
      return this.isDivideUnlocked && !Pelle.isDoomed
        ? `Divide Replicanti by ${format(Number.MAX_VALUE, 1, 1)}`
        : "Reset Replicanti amount";
    },
    galaxyCountDisplay() {
      const bought = this.boughtGalaxies;
      const extra = this.extraGalaxies;
      const galaxyCount = extra > 0 ? `${formatInt(bought)}+${formatInt(extra)}` : formatInt(bought);
      return `Currently: ${galaxyCount}`;
    },
    autobuyer() {
      return Autobuyer.replicantiGalaxy;
    },
    autobuyerTextDisplay() {
      const auto = this.isAutoActive;
      const disabled = !this.isAutoEnabled;
      return `Auto Galaxy ${auto ? "ON" : "OFF"}${disabled ? " (disabled)" : ""}`;
    },
    forceEnableTextDisplay() {
      return `Force enable auto galaxy ${this.isForceEnabled ? "ON":"OFF"}`
    }
  },
  methods: {
    update() {
      const rg = Replicanti.galaxies;
      this.isAvailable = rg.canBuyMore;
      this.boughtGalaxies = rg.bought;
      this.extraGalaxies = rg.extra;
      this.isDivideUnlocked = Achievement(126).isUnlocked;
      const auto = Autobuyer.replicantiGalaxy;
      this.isAutoUnlocked = auto.isUnlocked;
      this.isForceEnabled = auto.isForceEnabled;
      this.isAutoActive = auto.isActive;
      this.isAutoEnabled = auto.isEnabled;
    },
    handleAutoToggle(value) {
      Autobuyer.replicantiGalaxy.isActive = value;
      this.update();
    },
    handleForceEnable(value) {
      Autobuyer.replicantiGalaxy.isForceEnabled = value;
      this.update();
    },
    handleClick() {
      replicantiGalaxyRequest();
    }
  }
};
</script>

<template>
  <div class="l-spoon-btn-group">
    <PrimaryButton
      :enabled="isAvailable"
      class="o-primary-btn--replicanti-galaxy"
      @click="handleClick"
    >
      {{ resetActionDisplay }} for a Replicanti Galaxy
      <br>
      {{ galaxyCountDisplay }}
    </PrimaryButton>
    <PrimaryToggleButton
      v-if="isAutoUnlocked"
      :value="isAutoActive"
      :on="autobuyerTextDisplay"
      :off="autobuyerTextDisplay"
      class="l--spoon-btn-group__little-spoon o-primary-btn--replicanti-galaxy-toggle"
      @input="handleAutoToggle"
    />
    <PrimaryToggleButton
      v-if="isAutoUnlocked"
      :value="isForceEnabled"
      :on="forceEnableTextDisplay"
      :off="forceEnableTextDisplay"
      class="l--spoon-btn-group__little-spoon o-primary-btn--replicanti-galaxy-toggle"
      @input="handleForceEnable"
    />
  </div>
</template>

<style scoped>

</style>
