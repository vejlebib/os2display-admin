<?php
/**
 * @file
 * This file is a part of the Indholdskanalen MainBundle.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Indholdskanalen\MainBundle\Services;

use Symfony\Component\DependencyInjection\ContainerAware;
use JMS\Serializer\SerializerBuilder;
use JMS\Serializer\SerializationContext;

/**
 * Class MiddlewareCommunication
 *
 * @package Indholdskanalen\MainBundle\Services
 */
class MiddlewareCommunication extends ContainerAware
{
  protected $templateService;

  function __construct(TemplateService $templateService) {
    $this->templateService = $templateService;
  }

  protected function curlSendChannel($channel) {
    // Send  post request to middleware (/push/channel).
    $url = $this->container->getParameter("middleware_host") . "/push/channel";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $channel);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
      'Content-type: application/json',
      'Content-Length: ' . strlen($channel),
    ));
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);

    if (!$result = curl_exec($ch)) {
      $logger = $this->container->get('logger');
      $logger->error(curl_error($ch));
    }

    curl_close($ch);
  }

  /**
   * Pushes the channels for each screen to the middleware.
   */
  public function pushChannels() {
    // Get doctrine handle
    $doctrine = $this->container->get('doctrine');

    // Get all screens
    $screens = $doctrine->getRepository('IndholdskanalenMainBundle:Screen')->findAll();

    foreach($screens as $screen) {
      $serializer = $this->container->get('jms_serializer');
      $jsonContent = $serializer->serialize($screen, 'json', SerializationContext::create()->setGroups(array('middleware')));

      $this->curlSendChannel($jsonContent);
    }
  }
}
