# A simple python script that moves a servo motor to a specific angle
from time import sleep
import RPi.GPIO as GPIO
import sys

def setServoAngle(servo, angle):
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)
    GPIO.setup(servo, GPIO.OUT)
    pwm = GPIO.PWM(servo, 50)
    pwm.start(8)
    dutyCycle = angle / 18. + 3.
    pwm.ChangeDutyCycle(dutyCycle)
    sleep(0.4)
    pwm.stop()
    GPIO.cleanup()

if __name__ == '__main__':
    servo = int(sys.argv[1])
    angle = int(sys.argv[2])
    setServoAngle(servo, angle)